import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FUNCTION_URL = Deno.env.get("SUPABASE_URL")?.replace("localhost:54321", "127.0.0.1:54321") + "/functions/v1";

// --- Enterprise Telemetry ---
function logTrace(event: string, meta: Record<string, any>) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    service: "supervisor-agent",
    event,
    ...meta
  }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const t0 = performance.now();
  let correlationId = req.headers.get("x-correlation-id") || crypto.randomUUID();

  try {
    // Expecting a standard Supabase Postgres Webhook payload
    // Format: { type: "INSERT", table: "projects", record: { id, address, ... } }
    const payload = await req.json();

    if (payload.type !== "INSERT" || payload.table !== "projects") {
      return new Response(JSON.stringify({ status: "ignored" }), { headers: corsHeaders });
    }

    const project = payload.record;
    logTrace("agent_dispatched", { correlation_id: correlationId, project_id: project.id, address: project.address });

    const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // --- AUTONOMOUS WORKFLOW ---

    // 1. Fetch Comps
    logTrace("fetching_comps", { correlation_id: correlationId });
    const compsRes = await fetch(`${FUNCTION_URL}/comps-fetch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "x-correlation-id": correlationId
      },
      body: JSON.stringify({ address: project.address, limit: 3 })
    });
    const compsData = await compsRes.json();

    // 2. Formulate Initial Investment Committee (IC) Context
    logTrace("generating_ic_memo", { correlation_id: correlationId });
    const systemPrompt = `You are a real estate acquisitions director. A new deal just hit the pipeline. 
Write a highly concise 3-paragraph Investment Committee memo draft characterizing the asset based on the provided comps.
Asset: ${project.address}, ${project.city}, ${project.state}
Comps: ${JSON.stringify(compsData.comps ?? [])}`;

    const llmRes = await fetch(`${FUNCTION_URL}/llm-proxy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "x-correlation-id": correlationId
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // Use Anthropic for reasoning
        provider: "anthropic",
        system: "You are a Tier 1 Private Equity acquisitions analyst.",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.2, // Highly deterministic output
        max_tokens: 800
      })
    });
    const llmData = await llmRes.json();

    // 3. Save draft to the Intelligence store
    logTrace("saving_memo", { correlation_id: correlationId });
    await supa.from("notes").insert({
      project_id: project.id,
      title: `[AUTOGEN] Initial IC Memo: ${project.name}`,
      content: llmData.content || "Agent failed to generate context.",
      tags: ["agent", "underwriting", "memo"]
    });

    const duration = performance.now() - t0;
    logTrace("request_completed", { correlation_id: correlationId, duration_ms: Math.round(duration) });

    return new Response(JSON.stringify({ status: "success", comps_found: compsData.count }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    logTrace("request_failed", { correlation_id: correlationId, error: err.message });
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
