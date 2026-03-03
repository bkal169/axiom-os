// Supabase Edge Function: security-log-event
// Converted from Next.js POST /api/security/log-event → Deno Edge Function
// Logs security audit events to the security_events table.
// Deploy: supabase functions deploy security-log-event

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

    const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    try {
        const body = await req.json();

        // Extract IP from Deno edge request headers
        const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
        const ua = req.headers.get("user-agent") || null;

        const { data, error } = await supabase
            .from("security_events")
            .insert({
                tenant_id: body.tenant_id || null,
                user_id: body.user_id || null,
                event_type: body.event_type,
                ip_address: ip,
                user_agent: ua,
                metadata: body.metadata || {},
            })
            .select("id")
            .single();

        if (error) throw error;

        return new Response(JSON.stringify({ id: data.id }), {
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
