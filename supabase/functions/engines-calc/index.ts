// Supabase Edge Function: engines-calc
// Remote cloud execution for CalcHub frontend component
// Deploy: supabase functions deploy engines-calc

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

    try {
        const body = await req.json();
        const type = body.type;
        let result = {};

        if (type === "mortgage") {
            const { loan, rate, years } = body;
            const n = years * 12;
            const r = rate / 100 / 12;
            const pmt = r > 0 ? loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : loan / n;
            result = { payment: pmt };
        } else if (type === "roi") {
            const { purchase, rehab, arv } = body;
            const totalCost = purchase + rehab;
            const profit = arv - totalCost;
            const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
            result = { profit, roi };
        } else if (type === "caprate") {
            const { noi, value } = body;
            const capRate = value > 0 ? (noi / value) * 100 : 0;
            result = { capRate };
        }

        // Optional: log to an analytics table in Supabase 
        // -> const supabase = createClient(...)

        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
