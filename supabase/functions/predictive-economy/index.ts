// Supabase Edge Function: predictive-economy
// Converted from Next.js GET /api/predictive-economy → Deno Edge Function
// GET ?region=ORLANDO_FL&asset_type=subdivision
// Deploy: supabase functions deploy predictive-economy

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
    const region = url.searchParams.get("region") || "US";
    const assetType = url.searchParams.get("asset_type") || "generic";

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const { data, error } = await supabase
            .from("predictive_economy_baselines")
            .select("*")
            .eq("region", region)
            .eq("asset_type", assetType)
            .single();

        if (error || !data) {
            return new Response(
                JSON.stringify({ error: error?.message || "No baseline found for this region/asset_type" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        return new Response(JSON.stringify({ baseline: data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
