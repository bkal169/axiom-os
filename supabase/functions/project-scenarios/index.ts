// Supabase Edge Function: project-scenarios
// Converted from Next.js App Router → Deno/Supabase Edge Function
// Handles GET (list) and POST (create) for project scenarios.
// Deploy: supabase functions deploy project-scenarios

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Extract project ID from URL: /project-scenarios?project_id=xxx
    const url = new URL(req.url);
    const projectId = url.searchParams.get("project_id") || url.pathname.split("/").pop();

    try {
        if (req.method === "GET") {
            // List all scenarios for a project
            const { data, error } = await supabase
                .from("scenarios")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return new Response(JSON.stringify({ scenarios: data || [] }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (req.method === "POST") {
            const body = await req.json();

            const insert = {
                project_id: projectId,
                name: body.name || "Custom Scenario",
                kind: body.kind || "user_defined",
                baseline_id: body.baseline_id || null,
                horizon_months: body.horizon_months ?? 24,
                labor_index: body.labor_index ?? 1.0,
                materials_index: body.materials_index ?? 1.0,
                rate_delta_bps: body.rate_delta_bps ?? 0,
                rent_growth_delta_pct: body.rent_growth_delta_pct ?? 0,
                outputs: body.outputs || null,
            };

            const { data, error } = await supabase
                .from("scenarios")
                .insert(insert)
                .select("*")
                .single();

            if (error) throw error;
            return new Response(JSON.stringify({ scenario: data }), {
                status: 201,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
