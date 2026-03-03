-- Axiom OS V2: Metered Billing & Usage Tracking Schema
-- 1. Create billing_usage table to track granular API passthrough costs
CREATE TABLE IF NOT EXISTS public.billing_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id TEXT NOT NULL,
    -- The client's workspace ID
    service_type TEXT NOT NULL,
    -- e.g., 'llm_inference', 'comps_fetch', 'fred_query'
    provider TEXT NOT NULL,
    -- e.g., 'anthropic', 'openai', 'attom', 'costar'
    quantity NUMERIC NOT NULL,
    -- e.g., token count, or number of comps returned
    cost_basis NUMERIC NOT NULL,
    -- The raw cost to Axiom (e.g., $0.015 per 1K Opus tokens)
    markup_pct NUMERIC DEFAULT 0.15,
    -- Standard 15% margin on API passthrough
    stripe_meter_event_id TEXT,
    -- ID returned from Stripe upon successful metered reporting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Index for fast aggregation by tenant for dashboard charts
CREATE INDEX IF NOT EXISTS idx_billing_usage_tenant ON public.billing_usage(tenant_id, created_at DESC);
-- 2. Add billing constraints to the tenant_profiles (or similar master config)
-- Assuming we have a basic profiles table, we inject hard caps to prevent runaway LLM costs
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS monthly_usage_cap NUMERIC DEFAULT 500.00,
    -- Hard stop at $500 monthly internal cost
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
-- Verify
DO $$ BEGIN RAISE NOTICE 'Billing usage schema applied with 15%% default markup.';
END $$;