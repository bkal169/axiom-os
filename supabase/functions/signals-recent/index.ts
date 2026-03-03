// Supabase Edge Function: signals-recent
// Converted from Next.js GET /api/signals/recent → Deno Edge Function
// GET ?region=US&asset_type=subdivision&limit=20
// Deploy: supabase functions deploy signals-recent

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
    const region = url.searchParams.get("region");
    const assetType = url.searchParams.get("asset_type");
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 100);

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        let query = supabase
            .from("signals")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (region) query = query.eq("region", region);
        if (assetType) query = query.eq("asset_type", assetType);

        const { data, error } = await query;

        if (error) throw error;

        return new Response(JSON.stringify({ signals: data || [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
