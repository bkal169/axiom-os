-- V5 Migration 5: Seed Tax and Opportunity Zone Data (FL, TX, GA, NC, AZ)
-- Applied: 2026-03-23

-- 1. Insert State-level Tax Codes
INSERT INTO public.tax_codes (jurisdiction, jurisdiction_level, code, category, rate, description, effective_date)
VALUES
  -- Florida
  ('FL', 'state', 'FL-INC-2026', 'income', 0.00, 'Florida State Corporate/Personal Income Tax (No state individual income tax)', '2020-01-01'),
  ('FL', 'state', 'FL-SALES-2026', 'special', 0.06, 'Florida State Sales Tax', '2020-01-01'),
  
  -- Texas
  ('TX', 'state', 'TX-INC-2026', 'income', 0.00, 'Texas State Income Tax (No state individual income tax)', '2020-01-01'),
  ('TX', 'state', 'TX-SALES-2026', 'special', 0.0625, 'Texas State Sales Tax', '2020-01-01'),
  
  -- Georgia
  ('GA', 'state', 'GA-INC-2026', 'income', 0.0549, 'Georgia Flat State Income Tax', '2024-01-01'),
  ('GA', 'state', 'GA-SALES-2026', 'special', 0.04, 'Georgia State Sales Tax', '2020-01-01'),

  -- North Carolina
  ('NC', 'state', 'NC-INC-2026', 'income', 0.045, 'North Carolina Flat State Income Tax', '2024-01-01'),
  ('NC', 'state', 'NC-SALES-2026', 'special', 0.0475, 'North Carolina State Sales Tax', '2020-01-01'),

  -- Arizona
  ('AZ', 'state', 'AZ-INC-2026', 'income', 0.025, 'Arizona Flat State Income Tax', '2023-01-01'),
  ('AZ', 'state', 'AZ-SALES-2026', 'special', 0.056, 'Arizona State Sales Tax', '2020-01-01')
ON CONFLICT DO NOTHING;

-- 2. Insert Sample Average County Property Tax Rates for Major MSA targets
INSERT INTO public.tax_codes (jurisdiction, jurisdiction_level, code, category, rate, description, effective_date)
VALUES
  ('Orange County, FL', 'county', 'FL-ORC-PROP', 'property', 0.0098, 'Average Property Tax Rate for Orange County (Orlando)', '2020-01-01'),
  ('Travis County, TX', 'county', 'TX-TRA-PROP', 'property', 0.0185, 'Average Property Tax Rate for Travis County (Austin)', '2020-01-01'),
  ('Fulton County, GA', 'county', 'GA-FUL-PROP', 'property', 0.0102, 'Average Property Tax Rate for Fulton County (Atlanta)', '2020-01-01'),
  ('Mecklenburg County, NC', 'county', 'NC-MEC-PROP', 'property', 0.0096, 'Average Property Tax Rate for Mecklenburg County (Charlotte)', '2020-01-01'),
  ('Maricopa County, AZ', 'county', 'AZ-MAR-PROP', 'property', 0.0062, 'Average Property Tax Rate for Maricopa County (Phoenix)', '2020-01-01')
ON CONFLICT DO NOTHING;

-- 3. Insert Sample Qualified Opportunity Zone Tracts
INSERT INTO public.opportunity_zones (tract_id, state, county, designated_date, expires_at)
VALUES
  -- Florida (Orlando Area)
  ('12095010500', 'FL', 'Orange County', '2018-06-14', '2028-12-31'),
  ('12095010600', 'FL', 'Orange County', '2018-06-14', '2028-12-31'),
  
  -- Texas (Austin Area)
  ('48453000603', 'TX', 'Travis County', '2018-06-14', '2028-12-31'),
  ('48453000604', 'TX', 'Travis County', '2018-06-14', '2028-12-31'),
  
  -- Georgia (Atlanta Area)
  ('13121003700', 'GA', 'Fulton County', '2018-06-14', '2028-12-31'),
  
  -- North Carolina (Charlotte Area)
  ('37119003902', 'NC', 'Mecklenburg County', '2018-06-14', '2028-12-31'),
  
  -- Arizona (Phoenix Area)
  ('04013112504', 'AZ', 'Maricopa County', '2018-06-14', '2028-12-31')
ON CONFLICT DO NOTHING;
