-- ============================================================
-- 001_axiom_core_schema.sql
-- Phase 4 Core Tables: signals, predictive_economy_baselines,
-- scenarios, decision_artifacts
-- Run via: supabase db push OR paste into Supabase SQL Editor
-- ============================================================
create extension if not exists postgis;
create extension if not exists "uuid-ossp";
-- ─── 1) SIGNALS ─────────────────────────────────────────────
-- Unified bus for news + market events ingested from RSS, APIs, tickers
create table if not exists signals (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    domain text not null,
    -- 'macro' | 'labor' | 'materials' | 'regulatory' | 'market'
    region text,
    -- e.g. 'US', 'FL', 'NYC'
    asset_type text,
    -- e.g. 'multifamily', 'subdivision', 'industrial'
    source_type text not null,
    -- 'rss' | 'news_api' | 'ticker' | 'manual'
    source_name text not null,
    -- e.g. 'FT', 'FRED', 'XLB'
    source_url text,
    title text,
    summary text,
    raw_payload jsonb,
    direction text,
    -- 'inflationary' | 'deflationary' | 'neutral'
    strength numeric,
    -- 0.0–1.0
    horizon_months int,
    tags text []
);
create index if not exists idx_signals_domain_time on signals (domain, created_at desc);
create index if not exists idx_signals_region_asset on signals (region, asset_type);
-- ─── 2) PREDICTIVE ECONOMY BASELINES ─────────────────────────
create table if not exists predictive_economy_baselines (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    region text not null,
    -- 'US', 'FL', 'ORLANDO_FL'
    asset_type text not null,
    -- 'multifamily', 'subdivision', etc.
    signals_window jsonb,
    -- { "from": "...", "to": "...", "count": 42 }
    labor_cost_index numeric,
    materials_cost_index numeric,
    materials_equity_link jsonb,
    labor_forecast jsonb,
    materials_forecast jsonb,
    unique (region, asset_type)
);
create index if not exists idx_pred_econ_region_asset on predictive_economy_baselines (region, asset_type);
-- ─── 3) SCENARIOS ────────────────────────────────────────────
create table if not exists scenarios (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    project_id uuid not null references projects(id) on delete cascade,
    name text not null,
    kind text not null,
    -- 'system' | 'user_defined'
    baseline_id uuid references predictive_economy_baselines(id),
    horizon_months int not null,
    labor_index numeric,
    materials_index numeric,
    rate_delta_bps int,
    rent_growth_delta_pct numeric,
    outputs jsonb
);
create index if not exists idx_scenarios_project on scenarios (project_id);
-- ─── 4) DECISION ARTIFACTS ───────────────────────────────────
create table if not exists decision_artifacts (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    project_id uuid not null references projects(id) on delete cascade,
    scenario_id uuid references scenarios(id),
    project_state jsonb not null,
    risk_snapshot jsonb,
    finance_snapshot jsonb,
    scoring_snapshot jsonb,
    economy_snapshot jsonb,
    memo_url text -- NOTE: outcome_id ref added in migration 003 once project_outcomes table exists
);
create index if not exists idx_decisions_project on decision_artifacts (project_id, created_at desc);