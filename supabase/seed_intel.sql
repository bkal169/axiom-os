
-- Seed Data for Intel Records
-- Run this in Supabase SQL Editor to populate the map/data layer

-- Ensure we have a user to attach to (or use a placeholder/admin UUID if known)
-- For this seed, we'll try to insert generous "Public" records if possible, 
-- or we can just rely on the user running this to own the records.
-- Strategy: We will assume the user running the seed is an admin or we just insert with a specific test user ID if provided.
-- BETTER STRATEGY for SQL Editor: Users usually run this. 
-- We'll use auth.uid() if running from dashboard, but in pure SQL seed, auth.uid() is null.
-- So we will create a dummy "System" user profile if it doesn't exist, or just insert with a placeholder UUID.

-- Let's create a placeholder UUID for "System Data"
DO $$
DECLARE
  system_user_id uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- We'll just assume this runs in a context where we can insert. 
  -- If constraints fail due to missing Auth user, the user will need to create a user first.
  -- For now, let's just insert some records that might be "Global" if we had a global flag, 
  -- but our schema relies on user_id. 
  -- We'll use '00000000-0000-0000-0000-000000000000' and ensure a profile exists for it? 
  -- Actually, let's just comment that the user should replace 'USER_ID' with their own ID.
END $$;

-- REALITY CHECK: For a "Lean Launch", users want to see data.
-- We will modify the schema slightly to allow NULL user_id for "Global" intel? 
-- No, schema says "user_id not null".
-- So, instructions: "Replace 'YOUR_USER_ID' with your actual User UUID from the auth.users table."

INSERT INTO public.intel_records (user_id, record_type, title, state, county, city, zipcode, metrics, source, source_date, notes)
VALUES 
-- 1. Zoning Record
('YOUR_USER_ID', 'ZONING', 'Miami-Dade T6-8-O Zoning', 'FL', 'Miami-Dade', 'Miami', '33127', 
 '{"max_height": 8, "density": "150 du/acre", "far": 5.0}', 
 'Miami 21 Code', '2023-01-01', 'High density urban core zoning allowing mixed use.'),

-- 2. Market Report
('YOUR_USER_ID', 'MARKET', 'Q4 2024 Multifamily Report - Orlando', 'FL', 'Orange', 'Orlando', '32801', 
 '{"cap_rate_avg": 5.2, "rent_growth_yoy": 3.5, "vacancy_rate": 4.8}', 
 'Costar', '2024-12-01', 'Orlando market stabilizing after unparalleled growth.'),

-- 3. Rent Comp
('YOUR_USER_ID', 'RENT_COMP', 'Wynwood 25 - 1BR', 'FL', 'Miami-Dade', 'Miami', '33127', 
 '{"sqft": 750, "rent": 2850, "psf": 3.80, "year_built": 2019}', 
 'Apartments.com', '2024-02-15', 'Comparable generic luxury comp.'),

-- 4. Demographics
('YOUR_USER_ID', 'DEMOGRAPHICS', 'Tampa Bay Migration Trends', 'FL', 'Hillsborough', 'Tampa', '33602', 
 '{"population_growth": 2.1, "median_income": 65000, "unemployment": 2.9}', 
 'US Census Bureau', '2023-11-30', 'Strong net migration from Northeast.');
