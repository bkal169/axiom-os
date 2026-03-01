-- Migration: Create Tenants and Leases tables
CREATE TABLE IF NOT EXISTS public.tenants (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    industry text,
    credit_rating text,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.leases (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    floor text,
    sqft numeric DEFAULT 0,
    annual_rent numeric DEFAULT 0,
    start_date date,
    end_date date,
    status text DEFAULT 'active',
    -- 'active', 'pipeline', 'expired'
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
-- RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own tenants" ON public.tenants FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own tenants" ON public.tenants FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own tenants" ON public.tenants FOR
UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users view leases for own deals" ON public.leases FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.deals
            WHERE id = leases.deal_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users insert leases" ON public.leases FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.deals
            WHERE id = deal_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Users update leases" ON public.leases FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.deals
            WHERE id = deal_id
                AND user_id = auth.uid()
        )
    );