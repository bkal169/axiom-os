// Supabase Edge Function: engines-risk
// Converted from Next.js GET /api/engines/risk/[id] → Deno Edge Function
// Returns stub risk assessment for a project and logs a risk_event.
// Deploy: supabase functions deploy engines-risk

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const url = new URL(req.url);
    // Expects ?project_id=xxx
    const projectId = url.searchParams.get("project_id") || url.pathname.split("/").pop();

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const { data: project, error } = await supabase
            .from("projects")
            .select("id, tenant_id, state")
            .eq("id", projectId)
            .single();

        if (error || !project) {
            return new Response(JSON.stringify({ error: "Project not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Stub risk output — replace with real RiskEngine integration
        const riskOutput = {
            risk_score: 65,
            findings: [
                {
                    risk_type: "flood_hazard",
                    severity: "high",
                    description: "Stub: site may be in or near a flood hazard area. Replace with real FEMA lookup.",
                    impact_to_timeline_days: 30,
                    impact_to_cost_pct: 5.0,
                    mitigation_actions: [
                        "Order updated flood certification",
                        "Consult civil engineer regarding drainage",
                    ],
                    confidence: 0.6,
                },
            ],
            narrative: "Stubbed risk narrative. Integrate RiskEngine (backend/src/engines/risk_engine.py) for real FEMA/EPA/terrain analysis.",
            total_time_impact_days: 30,
            total_cost_impact_pct: 5.0,
        };

        // Log risk event for drift monitoring
        await supabase.from("risk_events").insert({
            tenant_id: project.tenant_id,
            project_id: project.id,
            engine_version: "v0",
            inputs: project.state || {},
            output: riskOutput,
        });

        return new Response(JSON.stringify(riskOutput), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
