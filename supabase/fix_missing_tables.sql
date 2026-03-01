-- supabase/fix_missing_tables.sql
-- Unified Contacts Migration: Creation + Expansion + Hardening
-- Safe to re-run: all operations use IF NOT EXISTS / IF EXISTS guards.
-- ============================================================
-- 1. CREATE BASE CONTACTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id uuid REFERENCES public.organizations(id),
    first_name text,
    last_name text,
    email text,
    phone text,
    type text CHECK (
        type IN (
            'investor',
            'lender',
            'client',
            'vendor',
            'lead',
            'broker'
        )
    ),
    status text CHECK (status IN ('active', 'inactive', 'prospect')) DEFAULT 'prospect',
    tags text [] DEFAULT '{}',
    notes text,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);
-- ============================================================
-- 2. ADD INSTITUTIONAL COLUMNS (if missing)
-- ============================================================
ALTER TABLE public.contacts
ADD COLUMN IF NOT EXISTS max_ltv numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS min_loan_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_loan_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS min_check_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS max_check_size numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS debt_types text [] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS preferred_geographies text [] DEFAULT '{}';
-- ============================================================
-- 3. ENABLE RLS
-- ============================================================
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
-- ============================================================
-- 4. CLEANUP OLD POLICIES
-- ============================================================
DROP POLICY IF EXISTS contacts_tenant_select ON public.contacts;
DROP POLICY IF EXISTS contacts_tenant_insert ON public.contacts;
DROP POLICY IF EXISTS contacts_tenant_update ON public.contacts;
DROP POLICY IF EXISTS contacts_tenant_delete ON public.contacts;
DROP POLICY IF EXISTS "Users view own org contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users manage own org contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all access for authenticated users" ON public.contacts;
DROP POLICY IF EXISTS contacts_select ON public.contacts;
DROP POLICY IF EXISTS contacts_insert ON public.contacts;
DROP POLICY IF EXISTS contacts_update ON public.contacts;
DROP POLICY IF EXISTS contacts_delete ON public.contacts;
-- ============================================================
-- 5. APPLY HARDENED POLICIES (Authenticated Only)
-- ============================================================
CREATE POLICY "contacts_select" ON public.contacts FOR
SELECT TO authenticated USING (
        organization_id IN (
            SELECT org_id
            FROM public.user_profiles
            WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM public.user_profiles
            WHERE id = auth.uid()
                AND role = 'ADMIN_INTERNAL'
        )
    );
CREATE POLICY "contacts_insert" ON public.contacts FOR
INSERT TO authenticated WITH CHECK (
        organization_id IN (
            SELECT org_id
            FROM public.user_profiles
            WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM public.user_profiles
            WHERE id = auth.uid()
                AND role = 'ADMIN_INTERNAL'
        )
    );
CREATE POLICY "contacts_update" ON public.contacts FOR
UPDATE TO authenticated USING (
        organization_id IN (
            SELECT org_id
            FROM public.user_profiles
            WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM public.user_profiles
            WHERE id = auth.uid()
                AND role = 'ADMIN_INTERNAL'
        )
    ) WITH CHECK (
        organization_id IN (
            SELECT org_id
            FROM public.user_profiles
            WHERE id = auth.uid()
        )
        OR EXISTS (
            SELECT 1
            FROM public.user_profiles
            WHERE id = auth.uid()
                AND role = 'ADMIN_INTERNAL'
        )
    );
CREATE POLICY "contacts_delete" ON public.contacts FOR DELETE TO authenticated USING (
    organization_id IN (
        SELECT org_id
        FROM public.user_profiles
        WHERE id = auth.uid()
    )
    OR EXISTS (
        SELECT 1
        FROM public.user_profiles
        WHERE id = auth.uid()
            AND role = 'ADMIN_INTERNAL'
    )
);
-- ============================================================
-- 6. REALTIME
-- ============================================================
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'contacts'
) THEN ALTER PUBLICATION supabase_realtime
ADD TABLE contacts;
END IF;
END $$;