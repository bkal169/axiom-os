// Supabase Edge Function: decision-artifacts
// Converted from Next.js App Router → Deno/Supabase Edge Function
// POST: creates a decision artifact (project state + scenario snapshots + memo URL)
// Deploy: supabase functions deploy decision-artifacts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extract project ID from query param or path
    const url = new URL(req.url);
    const projectId = url.searchParams.get("project_id") || url.pathname.split("/").at(-2);

    try {
        if (req.method !== "POST") {
            return new Response(JSON.stringify({ error: "Method not allowed" }), {
                status: 405,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const body = await req.json();
        const { scenario_id } = body;

        // Load project
        const { data: project, error: projectError } = await supabase
            .from("projects")
            .select("id, state")
            .eq("id", projectId)
            .single();

        if (projectError || !project) {
            return new Response(JSON.stringify({ error: "Project not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Load scenario
        const { data: scenario, error: scenarioError } = await supabase
            .from("scenarios")
            .select("*")
            .eq("id", scenario_id)
            .single();

        if (scenarioError || !scenario) {
            return new Response(JSON.stringify({ error: "Scenario not found" }), {
                status: 404,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Collect snapshots — use request-supplied or stubs
        const riskSnapshot = body.risk_snapshot || {
            risk_score: 42,
            findings: [],
            narrative: "Stub risk snapshot — integrate RiskEngine output here.",
        };
        const financeSnapshot = body.finance_snapshot || {
            irr: scenario.outputs?.irr ?? 18.2,
            equity_multiple: scenario.outputs?.equity_multiple ?? 1.9,
            dscr: 1.35,
        };
        const scoringSnapshot = body.scoring_snapshot || {
            composite_score: 78,
            subscores: {},
        };
        const economySnapshot = body.economy_snapshot || {
            baseline: {},
            signals_summary: {},
        };

        const memoUrl = body.memo_url ||
            `https://buildaxiom.dev/memos/${projectId}-${scenario_id}-${Date.now()}.pdf`;

        const { data, error } = await supabase
            .from("decision_artifacts")
            .insert({
                project_id: projectId,
                scenario_id,
                project_state: project.state,
                risk_snapshot: riskSnapshot,
                finance_snapshot: financeSnapshot,
                scoring_snapshot: scoringSnapshot,
                economy_snapshot: economySnapshot,
                memo_url: memoUrl,
            })
            .select("*")
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ decision_artifact: data }), {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
