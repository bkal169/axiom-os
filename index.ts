import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = Deno.env.get("APP_URL") || "https://axiom-os.vercel.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { action, price_id, user_id, return_url } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Look up existing Stripe customer ID
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id, display_name")
      .eq("id", user_id)
      .single();

    // Get user email from auth
    const { data: { user } } = await supabase.auth.admin.getUserById(user_id);
    const email = user?.email;

    if (action === "create_portal") {
      if (!profile?.stripe_customer_id) {
        return new Response(
          JSON.stringify({ error: "No Stripe customer found. Complete a checkout first." }),
          { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      const portalRes = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          customer: profile.stripe_customer_id,
          return_url: return_url || `${APP_URL}`,
        }),
      });

      const portal = await portalRes.json();
      if (!portalRes.ok) throw new Error(portal.error?.message || "Portal creation failed");

      return new Response(JSON.stringify({ url: portal.url }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    if (action === "create_checkout") {
      // Resolve or create Stripe customer
      let customerId = profile?.stripe_customer_id;

      if (!customerId && email) {
        // Search for existing customer by email
        const searchRes = await fetch(
          `https://api.stripe.com/v1/customers/search?query=email:'${email}'`,
          { headers: { Authorization: `Bearer ${STRIPE_SECRET}` } }
        );
        const searchData = await searchRes.json();
        if (searchData.data?.length > 0) {
          customerId = searchData.data[0].id;
        } else {
          // Create new customer
          const createRes = await fetch("https://api.stripe.com/v1/customers", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${STRIPE_SECRET}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              email,
              name: profile?.display_name || email,
              metadata: JSON.stringify({ supabase_user_id: user_id }),
            }),
          });
          const customer = await createRes.json();
          customerId = customer.id;
        }

        // Save customer ID
        await supabase
          .from("user_profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", user_id);
      }

      // Log activity
      await supabase.from("activity_log").insert({
        user_id,
        action: "checkout_started",
        entity_type: "subscription",
        metadata: { price_id, customer_id: customerId },
      });

      // Create checkout session
      const params: Record<string, string> = {
        "payment_method_types[]": "card",
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        mode: "subscription",
        success_url: `${APP_URL}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}?checkout=cancelled`,
        "metadata[supabase_user_id]": user_id,
        "subscription_data[metadata][supabase_user_id]": user_id,
      };

      if (customerId) params["customer"] = customerId;
      else if (email) params["customer_email"] = email;

      const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(params),
      });

      const session = await sessionRes.json();
      if (!sessionRes.ok) throw new Error(session.error?.message || "Checkout session failed");

      return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
