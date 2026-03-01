import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.16.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            throw new Error("Missing Authorization header");
        }

        const { action, price_id, success_url, cancel_url, return_url } = await req.json();

        // Init Supabase client with the user's JWT to ensure they are authenticated
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: { headers: { Authorization: authHeader } },
            }
        );

        // Get the user from the JWT
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
            throw new Error("Unauthorized");
        }

        // Now initialize Supabase Service Role client to fetch user profile details
        // (In case the profile is RLS restricted for reading the stripe customer ID)
        const supabaseAdmin = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("stripe_customer_id, email")
            .eq("id", user.id)
            .single();

        let customerId = profile?.stripe_customer_id;

        // --- CREATE CHECKOUT SESSION ---
        if (action === "create_checkout") {
            if (!price_id || !success_url || !cancel_url) {
                throw new Error("Missing required parameters for checkout");
            }

            // If user doesn't have a Stripe customer ID, let Stripe create one based on their email.
            // We will save it in the webhook.
            const sessionConfig: Stripe.Checkout.SessionCreateParams = {
                payment_method_types: ["card"],
                billing_address_collection: "required",
                customer: customerId ? customerId : undefined,
                customer_email: customerId ? undefined : (profile?.email || user.email),
                line_items: [
                    {
                        price: price_id,
                        quantity: 1,
                    },
                ],
                mode: "subscription",
                success_url,
                cancel_url,
                subscription_data: {
                    metadata: {
                        user_id: user.id,
                    },
                },
                metadata: {
                    user_id: user.id, // Ensure we tie this checkout session back to the Supabase user
                },
            };

            const session = await stripe.checkout.sessions.create(sessionConfig);

            return new Response(JSON.stringify({ url: session.url }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // --- CREATE BILLING PORTAL SESSION ---
        if (action === "create_portal") {
            if (!return_url) {
                throw new Error("Missing return_url for portal");
            }

            if (!customerId) {
                throw new Error("You don't have an active subscription yet.");
            }

            const session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url,
            });

            return new Response(JSON.stringify({ url: session.url }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        throw new Error(`Unknown action: ${action}`);
    } catch (error: any) {
        console.error("Function error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
