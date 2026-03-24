import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "npm:stripe@^14.14.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const action = body.action || "create_checkout";
        const supa = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const origin = req.headers.get("origin") || "http://localhost:5173";

        // --- METERED BILLING: Record API Usage Event ---
        if (action === "record_usage") {
            const { tenant_id, service_type, quantity, provider, cost_basis } = body;

            // Lookup tenant profile
            const { data: profile } = await supa.from("profiles").select("stripe_customer_id").eq("id", tenant_id).single();
            if (!profile?.stripe_customer_id) throw new Error("Tenant has no active Stripe subscription");

            // Look up the active subscription item for the metered product
            const subscriptions = await stripe.subscriptions.list({ customer: profile.stripe_customer_id, status: "active" });
            if (!subscriptions.data.length) throw new Error("No active subscription to bill against.");

            const subItem = subscriptions.data[0].items.data.find(i => i.price.billing_scheme === "metered");
            if (!subItem) throw new Error("No metered billing item attached to this subscription.");

            // Bill Stripe for the usage
            const record = await stripe.subscriptionItems.createUsageRecord(
                subItem.id,
                { quantity: Math.ceil(quantity), timestamp: Math.floor(Date.now() / 1000), action: "increment" },
                { idempotencyKey: `${tenant_id}-${Date.now()}` }
            );

            // Save audit log to Supabase
            await supa.from("billing_usage").insert({
                tenant_id, service_type, provider, quantity, cost_basis, stripe_meter_event_id: record.id
            });

            return new Response(JSON.stringify({ status: "metered_event_recorded", record }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }

        // --- CREATE BILLING PORTAL SESSION ---
        if (action === "create_portal") {
            const { customerId, return_url } = body;
            if (!return_url) throw new Error("Missing return_url for portal");
            if (!customerId) throw new Error("You don't have an active subscription yet.");

            const portalSession = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url,
            });

            return new Response(JSON.stringify({ url: portalSession.url }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // --- STANDARD CHECKOUT ---
        // Map tier name → Stripe price ID (set these env vars in Supabase dashboard)
        const PRICE_MAP: Record<string, string> = {
            pro:          Deno.env.get("STRIPE_PRO_PRICE_ID") ?? "",
            pro_plus:     Deno.env.get("STRIPE_PRO_PLUS_PRICE_ID") ?? "",
            enterprise:   Deno.env.get("STRIPE_ENTERPRISE_PRICE_ID") ?? "",
        };

        const tier = body.tier as string | undefined;
        const price_id = body.price_id || (tier ? PRICE_MAP[tier] : "") || Deno.env.get("STRIPE_PRO_PRICE_ID") || "";

        if (!price_id) throw new Error(`No Stripe price configured for tier: ${tier ?? "unknown"}. Set STRIPE_PRO_PRICE_ID / STRIPE_PRO_PLUS_PRICE_ID in Supabase secrets.`);

        const { customerId } = body;

        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ["card"],
            line_items: [{ price: price_id, quantity: 1 }],
            mode: "subscription",
            success_url: `${origin}/billing?success=true`,
            cancel_url: `${origin}/billing?canceled=true`,
        };

        if (customerId) {
            sessionConfig.customer = customerId;
        }

        const checkoutSession = await stripe.checkout.sessions.create(sessionConfig);

        return new Response(JSON.stringify({ url: checkoutSession.url }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (err: any) {
        console.error("Stripe Checkout Error:", err);
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
