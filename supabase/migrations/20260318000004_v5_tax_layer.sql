-- V5 Migration 4: Tax Intelligence Layer
-- Applied: 2026-03-18

-- 1. Tax codes registry
CREATE TABLE IF NOT EXISTS public.tax_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction TEXT NOT NULL,
  jurisdiction_level TEXT CHECK (jurisdiction_level IN ('federal','state','county','city','special_district')),
  code TEXT NOT NULL,
  category TEXT CHECK (category IN ('property','transfer','income','capital_gains','special','opportunity_zone','depreciation')),
  rate NUMERIC,
  flat_amount NUMERIC,
  description TEXT,
  notes TEXT,
  effective_date DATE,
  sunset_date DATE,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tax_codes_jurisdiction ON public.tax_codes(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_tax_codes_category ON public.tax_codes(category);

-- 2. Property tax records
CREATE TABLE IF NOT EXISTS public.property_tax_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  tax_year INTEGER NOT NULL,
  parcel_number TEXT,
  county TEXT,
  state TEXT,
  assessed_value NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  mill_rate NUMERIC,
  exemptions JSONB DEFAULT '{}',
  paid_date DATE,
  delinquent BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'county_assessor',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_property_tax_deal_id ON public.property_tax_records(deal_id);
CREATE INDEX IF NOT EXISTS idx_property_tax_project_id ON public.property_tax_records(project_id);

-- 3. Appraisal district assessments
CREATE TABLE IF NOT EXISTS public.tax_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  appraisal_district TEXT,
  assessed_land_value NUMERIC DEFAULT 0,
  assessed_improvement_value NUMERIC DEFAULT 0,
  total_assessed NUMERIC GENERATED ALWAYS AS (assessed_land_value + assessed_improvement_value) STORED,
  assessment_date DATE,
  protest_deadline DATE,
  protested BOOLEAN DEFAULT false,
  protest_outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tax_assessments_deal_id ON public.tax_assessments(deal_id);

-- 4. IRS Opportunity Zone tract registry
CREATE TABLE IF NOT EXISTS public.opportunity_zones (
  tract_id TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  county TEXT,
  designated_date DATE DEFAULT '2018-06-14',
  expires_at DATE DEFAULT '2028-12-31',
  geometry JSONB,
  population INTEGER,
  median_income NUMERIC,
  poverty_rate NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_oz_state ON public.opportunity_zones(state);

-- 5. Deal <-> OZ link
CREATE TABLE IF NOT EXISTS public.deal_oz_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  tract_id TEXT NOT NULL REFERENCES public.opportunity_zones(tract_id),
  capital_gain_deferred NUMERIC DEFAULT 0,
  step_up_pct NUMERIC DEFAULT 0,
  exclusion_eligible BOOLEAN DEFAULT false,
  investment_date DATE,
  qualified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_deal_oz_deal_id ON public.deal_oz_links(deal_id);

-- 6. Depreciation schedules (MACRS + bonus)
CREATE TABLE IF NOT EXISTS public.depreciation_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  asset_class TEXT NOT NULL,
  cost_basis NUMERIC NOT NULL,
  useful_life_years INTEGER,
  method TEXT CHECK (method IN ('MACRS','SL','bonus','section_179')) DEFAULT 'MACRS',
  bonus_pct NUMERIC DEFAULT 0,
  placed_in_service_date DATE NOT NULL,
  annual_deduction NUMERIC,
  accumulated_depreciation NUMERIC DEFAULT 0,
  remaining_basis NUMERIC GENERATED ALWAYS AS (cost_basis - accumulated_depreciation) STORED,
  schedule JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_depreciation_project_id ON public.depreciation_schedules(project_id);

-- 7. 1031 exchange tracking
CREATE TABLE IF NOT EXISTS public.tax_1031_exchanges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id),
  relinquished_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  replacement_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  qi_name TEXT,
  qi_contact TEXT,
  sale_date DATE,
  identification_deadline DATE GENERATED ALWAYS AS (sale_date + INTERVAL '45 days') STORED,
  exchange_deadline DATE GENERATED ALWAYS AS (sale_date + INTERVAL '180 days') STORED,
  relinquished_value NUMERIC DEFAULT 0,
  replacement_value NUMERIC DEFAULT 0,
  boot_amount NUMERIC DEFAULT 0,
  deferred_gain NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('open','identified','complete','failed','cancelled')) DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_1031_org_id ON public.tax_1031_exchanges(org_id);

-- Find Opportunity Zone by coordinates
CREATE OR REPLACE FUNCTION find_oz_by_coordinates(p_lat FLOAT, p_lng FLOAT)
RETURNS TABLE(
  census_tract TEXT,
  state_fips TEXT,
  county_fips TEXT,
  oz_type TEXT,
  designation_year INTEGER
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    oz.census_tract,
    oz.state_fips,
    oz.county_fips,
    oz.oz_type,
    oz.designation_year
  FROM opportunity_zones oz
  WHERE ST_Contains(
    oz.geometry,
    ST_SetSRID(ST_Point(p_lng, p_lat), 4326)
  )
  LIMIT 1;
END;
$$;
