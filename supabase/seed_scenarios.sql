-- Seed initial base scenarios for the Financial Engine
-- Associates with the default "axiom-base-project" used in v1 architecture
INSERT INTO public.scenarios (
        id,
        project_id,
        name,
        config,
        created_at,
        updated_at
    )
VALUES (
        'scn_base_001',
        'axiom-base-project',
        'Base Case',
        '{
      "ltc": 60,
      "interest_rate": 6.5,
      "hold_period_months": 36,
      "exit_cap_rate": 5.25,
      "rent_growth_bps": 300,
      "expense_growth_bps": 250,
      "vacancy_rate": 5.0,
      "concessions_pct": 1.0,
      "inflation_cpi": 2.5
    }'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'scn_bear_001',
        'axiom-base-project',
        'Bear Case (Downside)',
        '{
      "ltc": 55,
      "interest_rate": 7.5,
      "hold_period_months": 48,
      "exit_cap_rate": 6.0,
      "rent_growth_bps": 100,
      "expense_growth_bps": 300,
      "vacancy_rate": 8.0,
      "concessions_pct": 2.5,
      "inflation_cpi": 4.0
    }'::jsonb,
        NOW(),
        NOW()
    ),
    (
        'scn_bull_001',
        'axiom-base-project',
        'Bull Case (Upside)',
        '{
      "ltc": 65,
      "interest_rate": 5.75,
      "hold_period_months": 24,
      "exit_cap_rate": 4.75,
      "rent_growth_bps": 500,
      "expense_growth_bps": 200,
      "vacancy_rate": 4.0,
      "concessions_pct": 0.5,
      "inflation_cpi": 2.0
    }'::jsonb,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO
UPDATE
SET name = EXCLUDED.name,
    config = EXCLUDED.config,
    updated_at = NOW();
-- Verify counts
DO $$ BEGIN RAISE NOTICE 'Seeded 3 scenarios: Base, Bear, Bull.';
END $$;