-- AxiomOS v19 — Initial Schema Migration
-- Generated: 2026-03-01
-- Supabase project: ubdhpacoqmlxudcvhyuu

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE public.deal_stage AS ENUM ('sourcing', 'screening', 'due_diligence', 'committee', 'closing', 'asset_mgmt', 'dead', 'sold');
CREATE TYPE public.intel_type AS ENUM ('ZONING', 'MARKET', 'RENT_COMP', 'COST', 'ABSORPTION', 'DEMOGRAPHICS', 'OTHER');
CREATE TYPE public.subscription_tier AS ENUM ('FREE', 'PRO', 'PRO_PLUS', 'ENTERPRISE');
CREATE TYPE public.user_role AS ENUM ('ADMIN_INTERNAL', 'CLIENT_SAAS', 'VIEWER');

-- ============================================================
-- CORE TABLES
-- ============================================================

CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  industry_vertical TEXT DEFAULT 'real_estate',
  team_size INTEGER DEFAULT 1,
  website TEXT,
  phone TEXT,
  primary_state TEXT DEFAULT 'FL',
  onboarded BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role public.user_role DEFAULT 'CLIENT_SAAS',
  subscription_tier public.subscription_tier DEFAULT 'FREE',
  org_id UUID REFERENCES public.organizations(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  stripe_current_period_end TIMESTAMPTZ,
  display_name TEXT,
  phone TEXT,
  role_title TEXT DEFAULT 'Developer',
  onboarded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  address TEXT,
  state TEXT,
  municipality TEXT,
  stage TEXT DEFAULT 'prospecting' CHECK (stage IN ('prospecting','underwriting','due_diligence','entitlement','construction','sell_out','closed','dead')),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- DEALS
-- ============================================================

CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  project_name TEXT NOT NULL,
  location TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  stage public.deal_stage DEFAULT 'sourcing',
  internal_only BOOLEAN DEFAULT false,
  acquisition_price NUMERIC DEFAULT 0,
  renovation_cost NUMERIC DEFAULT 0,
  projected_value NUMERIC DEFAULT 0,
  capital_required NUMERIC DEFAULT 0,
  capital_raised NUMERIC DEFAULT 0,
  projected_profit NUMERIC GENERATED ALWAYS AS (projected_value - (acquisition_price + renovation_cost)) STORED,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.deal_stage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id),
  from_stage public.deal_stage,
  to_stage public.deal_stage NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SITE DATA (per project)
-- ============================================================

CREATE TABLE public.site_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id),
  address TEXT, apn TEXT,
  gross_acres NUMERIC, net_acres NUMERIC,
  jurisdiction TEXT, county TEXT, state TEXT,
  general_plan TEXT, existing_use TEXT, proposed_use TEXT,
  shape TEXT, frontage TEXT, access TEXT, legal_desc TEXT,
  zone TEXT, overlay TEXT, du_ac TEXT, max_height TEXT,
  min_lot_size TEXT, min_lot_width TEXT, min_lot_depth TEXT,
  front_setback TEXT, rear_setback TEXT, side_setback TEXT,
  max_lot TEXT, parking_ratio TEXT,
  entitlement_type TEXT DEFAULT 'Tentative Map',
  entitlement_status TEXT DEFAULT 'Not Started',
  zoning_notes TEXT,
  alta_ordered TEXT DEFAULT 'No', alta_date TEXT,
  surveyor_name TEXT, easements TEXT, encroachments TEXT,
  soil_type TEXT, perc_rate TEXT, slope_max TEXT, cut_fill TEXT,
  expansive_soil TEXT DEFAULT 'No', liquefaction TEXT DEFAULT 'No',
  flood_zone TEXT DEFAULT 'X', firm_panel TEXT, firm_date TEXT,
  bfe TEXT, loma TEXT DEFAULT 'No',
  phase1 TEXT DEFAULT 'No', phase1_date TEXT, rec TEXT,
  wetlands TEXT DEFAULT 'None Observed', species TEXT,
  ceqa TEXT DEFAULT 'Class 32 - Infill', mitigation TEXT, air_quality TEXT,
  alta_items JSONB DEFAULT '[]', utilities JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- FINANCIAL MODELS
-- ============================================================

CREATE TABLE public.financial_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  label TEXT DEFAULT 'Base Case',
  total_lots INTEGER DEFAULT 50,
  land_cost NUMERIC DEFAULT 3000000,
  closing_costs NUMERIC DEFAULT 90000,
  hard_cost_per_lot NUMERIC DEFAULT 65000,
  soft_cost_pct NUMERIC DEFAULT 18,
  contingency_pct NUMERIC DEFAULT 10,
  sales_price_per_lot NUMERIC DEFAULT 185000,
  sales_commission NUMERIC DEFAULT 3,
  absorb_rate NUMERIC DEFAULT 3,
  planning_fees NUMERIC DEFAULT 120000,
  permit_fee_per_lot NUMERIC DEFAULT 8500,
  school_fee NUMERIC DEFAULT 3200,
  impact_fee_per_lot NUMERIC DEFAULT 12000,
  reserve_percentage NUMERIC DEFAULT 5,
  grm NUMERIC DEFAULT 14.2,
  irr_computed NUMERIC,
  npv_computed NUMERIC,
  deal_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.loan_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id),
  ltc NUMERIC DEFAULT 70, rate NUMERIC DEFAULT 9.5,
  term_months INTEGER DEFAULT 24, extension_months INTEGER DEFAULT 12,
  orig_fee NUMERIC DEFAULT 1.5, lender TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.equity_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id),
  gp_pct NUMERIC DEFAULT 10, lp_pct NUMERIC DEFAULT 90,
  pref_return NUMERIC DEFAULT 8, promote_pct NUMERIC DEFAULT 20,
  equity_multiple_target NUMERIC DEFAULT 2.0, irr_target NUMERIC DEFAULT 18,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PERMITS, RISKS, DD
-- ============================================================

CREATE TABLE public.permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  name TEXT NOT NULL, agency TEXT, duration TEXT, cost TEXT,
  status TEXT DEFAULT 'Not Started', required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  category TEXT NOT NULL, risk TEXT NOT NULL,
  likelihood TEXT CHECK (likelihood IN ('Low','Medium','High')),
  impact TEXT CHECK (impact IN ('Low','Medium','High','Critical')),
  severity TEXT CHECK (severity IN ('Low','Medium','High','Critical')),
  mitigation TEXT, status TEXT DEFAULT 'Open'
    CHECK (status IN ('Open','Mitigated','Accepted','Closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.dd_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id),
  category TEXT NOT NULL, item TEXT NOT NULL,
  completed BOOLEAN DEFAULT false, risk_level TEXT DEFAULT 'Medium',
  completed_at TIMESTAMPTZ, completed_by UUID REFERENCES auth.users(id),
  item_key TEXT, created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- COMPS & TASKS
-- ============================================================

CREATE TABLE public.comps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  address TEXT, price NUMERIC DEFAULT 0, lots INTEGER DEFAULT 0,
  price_per_lot NUMERIC DEFAULT 0, sale_date TEXT, source TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.site_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  title TEXT NOT NULL, assignee TEXT, due_date TEXT,
  priority TEXT DEFAULT 'Medium', status TEXT DEFAULT 'Open',
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INTEL
-- ============================================================

CREATE TABLE public.intel_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  record_type public.intel_type NOT NULL,
  title TEXT NOT NULL, state TEXT DEFAULT 'FL',
  county TEXT, city TEXT, zipcode TEXT,
  geo_tags TEXT[] DEFAULT '{}', asset_tags TEXT[] DEFAULT '{}',
  metrics JSONB DEFAULT '{}', source TEXT, source_date DATE,
  notes TEXT, internal_only BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.deal_intel_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id),
  intel_id UUID NOT NULL REFERENCES public.intel_records(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- CONTACTS & TENANTS
-- ============================================================

CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  first_name TEXT NOT NULL, last_name TEXT, email TEXT, phone TEXT,
  type TEXT CHECK (type IN ('investor','client','vendor','lead','broker')),
  status TEXT DEFAULT 'prospect' CHECK (status IN ('active','inactive','prospect')),
  tags TEXT[] DEFAULT '{}', notes TEXT, company TEXT,
  max_ltv NUMERIC DEFAULT 0, min_loan_size NUMERIC DEFAULT 0,
  max_loan_size NUMERIC DEFAULT 0, debt_types TEXT[] DEFAULT '{}',
  min_check_size NUMERIC DEFAULT 0, max_check_size NUMERIC DEFAULT 0,
  preferred_geographies TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id),
  name TEXT NOT NULL, industry TEXT, credit_rating TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  floor TEXT, sqft NUMERIC DEFAULT 0, annual_rent NUMERIC DEFAULT 0,
  start_date DATE, end_date DATE, status TEXT DEFAULT 'active', notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.deal_contacts (
  deal_id UUID NOT NULL REFERENCES public.deals(id),
  contact_id UUID NOT NULL REFERENCES public.contacts(id),
  role TEXT, organization_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (deal_id, contact_id)
);

-- ============================================================
-- VENDORS, NOTES, CALENDAR, INVOICES
-- ============================================================

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  name TEXT NOT NULL, type TEXT, status TEXT DEFAULT 'Active',
  contact TEXT, email TEXT, phone TEXT,
  insurance_exp DATE, msa_signed BOOLEAN DEFAULT false,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 10),
  notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL, content TEXT,
  category TEXT DEFAULT 'General', pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL, date TEXT NOT NULL,
  type TEXT DEFAULT 'Meeting', notes TEXT, time TEXT,
  color TEXT, deal TEXT, recurring TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  vendor TEXT, amount NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'General', status TEXT DEFAULT 'Pending',
  date TEXT, notes TEXT, deal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- AI & BILLING
-- ============================================================

CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  agent_id TEXT NOT NULL, messages JSONB DEFAULT '[]', model TEXT,
  created_at TIMESTAMPTZ DEFAULT now(), updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  org_id UUID REFERENCES public.organizations(id),
  event_type TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  stripe_subscription_id TEXT, stripe_customer_id TEXT,
  price_id TEXT, plan TEXT, status TEXT,
  current_period_start TIMESTAMPTZ, current_period_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  org_id UUID REFERENCES public.organizations(id),
  feature TEXT NOT NULL, count INTEGER DEFAULT 1,
  period_start DATE DEFAULT (date_trunc('month', now()))::date,
  period_end DATE DEFAULT ((date_trunc('month', now()) + '1 mon'::interval) - '1 day'::interval)::date,
  date DATE DEFAULT CURRENT_DATE, daily_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  org_id UUID REFERENCES public.organizations(id),
  action TEXT NOT NULL, entity_type TEXT, entity_id UUID,
  metadata JSONB DEFAULT '{}', ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin','member','viewer')),
  token TEXT UNIQUE DEFAULT encode(extensions.gen_random_bytes(32), 'hex'),
  accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMPTZ, accepted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ DEFAULT (now() + '7 days'::interval),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.pilot_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT DEFAULT 'landing-page',
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','contacted','onboarded','declined')),
  notes TEXT, name TEXT, company TEXT, phone TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.market_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id TEXT NOT NULL, source TEXT DEFAULT 'FRED',
  observation_date DATE NOT NULL, value NUMERIC,
  metadata JSONB DEFAULT '{}', fetched_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_projects_org_id ON public.projects(org_id);
CREATE INDEX idx_site_data_project_id ON public.site_data(project_id);
CREATE INDEX idx_financial_models_project_id ON public.financial_models(project_id);
CREATE INDEX idx_permits_project_id ON public.permits(project_id);
CREATE INDEX idx_risks_project_id ON public.risks(project_id);
CREATE INDEX idx_comps_org_id ON public.comps(org_id);
CREATE INDEX idx_comps_project_id ON public.comps(project_id);
CREATE INDEX idx_site_tasks_org_id ON public.site_tasks(org_id);
CREATE INDEX idx_site_tasks_project_id ON public.site_tasks(project_id);
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_user_profiles_org_id ON public.user_profiles(org_id);
CREATE INDEX idx_user_profiles_stripe_customer ON public.user_profiles(stripe_customer_id);
CREATE INDEX idx_subscription_events_stripe_event ON public.subscription_events(stripe_event_id);
CREATE INDEX idx_usage_tracking_user_date ON public.usage_tracking(user_id, date);
CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equity_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_intel_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pilot_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data_cache ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES (org-scoped multi-tenant)
-- ============================================================

-- user_profiles: own row only
CREATE POLICY "users_own_profile" ON public.user_profiles
  FOR ALL USING ((SELECT auth.uid()) = id);

-- organizations: members only
CREATE POLICY "org_members" ON public.organizations
  FOR ALL USING (
    id IN (SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

-- projects: org-scoped
CREATE POLICY "projects_org_scoped" ON public.projects
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

-- site_data: via project org
CREATE POLICY "site_data_org_scoped" ON public.site_data
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE org_id IN (
        SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

-- financial_models: via project org
CREATE POLICY "financial_models_org_scoped" ON public.financial_models
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE org_id IN (
        SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

-- loan_terms, equity_terms: same pattern
CREATE POLICY "loan_terms_org_scoped" ON public.loan_terms
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE org_id IN (
        SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "equity_terms_org_scoped" ON public.equity_terms
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE org_id IN (
        SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

-- deals: user-scoped
CREATE POLICY "deals_user_scoped" ON public.deals
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- permits, risks, dd: via project
CREATE POLICY "permits_org_scoped" ON public.permits
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE org_id IN (
        SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "risks_org_scoped" ON public.risks
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE org_id IN (
        SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

CREATE POLICY "dd_checklists_org_scoped" ON public.dd_checklists
  FOR ALL USING (
    project_id IN (
      SELECT id FROM public.projects WHERE org_id IN (
        SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid())
      )
    )
  );

-- comps, site_tasks: org-scoped directly
CREATE POLICY "comps_org_scoped" ON public.comps
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

CREATE POLICY "site_tasks_org_scoped" ON public.site_tasks
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

-- intel: user-scoped
CREATE POLICY "intel_user_scoped" ON public.intel_records
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- subscription_events, usage_tracking, activity_log: user-scoped
CREATE POLICY "sub_events_user_scoped" ON public.subscription_events
  FOR ALL USING (user_id = (SELECT auth.uid()));

CREATE POLICY "usage_user_scoped" ON public.usage_tracking
  FOR ALL USING (user_id = (SELECT auth.uid()));

CREATE POLICY "activity_user_scoped" ON public.activity_log
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- ai_conversations: user-scoped
CREATE POLICY "ai_conv_user_scoped" ON public.ai_conversations
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- team_invites: org-scoped
CREATE POLICY "team_invites_org_scoped" ON public.team_invites
  FOR ALL USING (
    org_id IN (SELECT org_id FROM public.user_profiles WHERE id = (SELECT auth.uid()))
  );

-- market_data_cache: read-only for all authenticated
CREATE POLICY "market_data_read_all" ON public.market_data_cache
  FOR SELECT USING (auth.role() = 'authenticated');

-- pilot_signups: insert-only public, read for admins
CREATE POLICY "pilot_signups_insert" ON public.pilot_signups
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create organization
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(NEW.raw_user_meta_data->>'company', split_part(NEW.email, '@', 1) || ' Development'))
  RETURNING id INTO new_org_id;

  -- Create user profile
  INSERT INTO public.user_profiles (id, org_id, display_name)
  VALUES (
    NEW.id,
    new_org_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
