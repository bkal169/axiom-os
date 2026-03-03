// Supabase Edge Function: engines-score
// Converted from Next.js POST /api/engines/score/[id] → Deno Edge Function
// Runs a heuristic composite scoring model and logs a scoring_event.
// Deploy: supabase functions deploy engines-score

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const url = new URL(req.url);
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

        const state = project.state || {};
        const riskScore = state.risk?.score ?? 65;
        const irr = state.finance?.irr ?? 18;
        const dscr = state.finance?.dscr ?? 1.3;

        // Heuristic composite scoring (swap for real ML model in models table)
        let composite = 0;
        composite += Math.max(0, Math.min(1, irr / 25)) * 40;           // IRR up to 25% → 40 pts
        composite += Math.max(0, Math.min(1, (dscr - 1) / 0.5)) * 25;  // DSCR 1.0–1.5 → 25 pts
        composite += Math.max(0, Math.min(1, (100 - riskScore) / 40)) * 25; // low risk → 25 pts
        composite += 10;                                                  // base 10 pts
        composite = Math.max(0, Math.min(100, composite));

        const output = {
            composite_score: composite,
            confidence: 60,
            subscores: {
                feasibility: composite,
                timeline_risk: state.risk?.timeline_risk ?? 30,
                budget_risk: state.risk?.budget_risk ?? 25,
                financeability: dscr >= 1.25 ? 80 : 60,
            },
            top_drivers: [
                { feature: "IRR", impact: irr, description: "Higher target IRR increases feasibility score." },
                { feature: "DSCR", impact: dscr, description: "Stronger DSCR improves financeability." },
                { feature: "Risk Score", impact: -riskScore, description: "Higher risk score reduces composite score." },
            ],
            mitigation_levers: [
                "Reduce leverage or improve DSCR to strengthen financeability.",
                "Mitigate key risks (permitting, flood, environmental) to raise composite score.",
            ],
        };

        // Log scoring event for model monitoring
        await supabase.from("scoring_events").insert({
            tenant_id: project.tenant_id,
            project_id: project.id,
            model_name: "deal_scoring_heuristic",
            model_version: "v0",
            inputs: state,
            output,
        });

        return new Response(JSON.stringify(output), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
