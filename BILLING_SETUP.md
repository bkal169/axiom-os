# Axiom OS Billing Setup Guide

You have successfully added the **Stripe Checkout** and **Stripe Webhook** Edge Functions to the repository! To make real transactions work, you must complete the setup in both your Stripe and Supabase dashboards.

---

## 1. Create Products in Stripe

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/products).
2. Create three **Products**:
   - **Pro** (e.g., $199/month, recurring)
   - **Pro+** (e.g., $499/month, recurring)
   - **Enterprise** (e.g., $2999/month, recurring)
3. Under each product, you will see an **API ID** for the price, looking like `price_1P....`
4. Copy these three Price IDs.

## 2. Set Vercel Environments (Frontend)

The frontend needs these Price IDs so it knows what to ask Stripe to charge.

1. Go to your [Vercel Dashboard](https://vercel.com).
2. Open your Axiom OS project > **Settings** > **Environment Variables**.
3. Add the following variables with your copied Price IDs:
   - `VITE_STRIPE_PRO_PRICE_ID=price_...`
   - `VITE_STRIPE_PRO_PLUS_PRICE_ID=price_...`
   - `VITE_STRIPE_ENTERPRISE_PRICE_ID=price_...`
4. Redeploy the application in Vercel to inject them into the React build.

## 3. Configure Supabase Edge Functions (Backend)

Supabase needs your Stripe secret keys to securely create checkout sessions and verify webhooks.

1. In your **Stripe Dashboard**, go to **Developers** > **API keys**.
2. Copy your **Secret key** (`sk_live_...` or `sk_test_...`).
3. In your **Stripe Dashboard**, go to **Developers** > **Webhooks**.
4. Click **Add an endpoint**:
   - URL: `https://<YOUR_SUPABASE_PROJECT_ID>.supabase.co/functions/v1/stripe-webhook`
   - Listen to events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
   - Click **Add endpoint**.
5. Once created, click "Reveal" under **Signing secret** to get your webhook secret (`whsec_...`).

Open your terminal, login to Supabase CLI, and run:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set STRIPE_PRO_PRICE_ID=price_...
supabase secrets set STRIPE_PRO_PLUS_PRICE_ID=price_...
supabase secrets set STRIPE_ENTERPRISE_PRICE_ID=price_...
```

## 4. Deploy the Functions

Make sure you have the Supabase CLI installed, link your project, and deploy the new functions:

```bash
supabase link --project-ref <YOUR_PROJECT_ID>
supabase functions deploy stripe-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

**Done!** When a user clicks "Upgrade to Pro" in your app, they will now be redirected to a real Stripe Checkout screen, and upon payment, their account tier in Supabase will immediately update.
