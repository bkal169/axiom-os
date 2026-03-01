import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

serve(async (req) => {
    try {
        const signature = req.headers.get("stripe-signature");
        if (!signature || !endpointSecret) {
            return new Response("Missing signature or secret", { status: 400 });
        }

        const body = await req.text();
        let event;

        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                endpointSecret
            );
        } catch (err: any) {
            console.error(`Webhook signature verification failed: ${err.message}`);
            return new Response(`Webhook Error: ${err.message}`, { status: 400 });
        }

        // Initialize Supabase Service Role client to bypass RLS for webhook updates
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        console.log(`Processing Stripe Event: ${event.type}`);

        if (
            event.type === "customer.subscription.created" ||
            event.type === "customer.subscription.updated" ||
            event.type === "customer.subscription.deleted"
        ) {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            const priceId = subscription.items.data[0].price.id;
            const status = subscription.status; // 'active', 'past_due', 'canceled', etc.

            // Map Price ID to our internal Tiers
            let tier = "free";
            if (status === "active" || status === "trialing") {
                if (priceId === Deno.env.get("STRIPE_PRO_PRICE_ID")) tier = "pro";
                else if (priceId === Deno.env.get("STRIPE_PRO_PLUS_PRICE_ID")) tier = "pro_plus";
                else if (priceId === Deno.env.get("STRIPE_ENTERPRISE_PRICE_ID")) tier = "enterprise";
                else {
                    console.warn(`Unknown price_id mapped to free: ${priceId}`);
                }
            } else {
                // If canceled or past_due, revert to free
                tier = "free";
            }

            // Check if we have the user_id in the subscription metadata (from checkout)
            let userId = subscription.metadata?.user_id;

            // Update the user_profiles table
            const updatePayload: any = {
                subscription_tier: tier,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscription.id,
                stripe_price_id: priceId,
                stripe_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            };

            if (userId) {
                // If we know exactly who this is from metadata, update them directly
                const { error } = await supabaseAdmin
                    .from("user_profiles")
                    .update(updatePayload)
                    .eq("id", userId);

                if (error) throw error;
            } else {
                // If we don't have user_id in metadata (e.g. manual subscription creation in Stripe),
                // we must look them up by stripe_customer_id
                const { error } = await supabaseAdmin
                    .from("user_profiles")
                    .update(updatePayload)
                    .eq("stripe_customer_id", customerId);

                if (error) throw error;
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        console.error("Webhook processing failed:", error);
        return new Response("Internal Server Error", { status: 500 });
    }
});
