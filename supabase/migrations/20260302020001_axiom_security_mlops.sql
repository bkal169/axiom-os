-- ============================================================
-- 002_axiom_security_mlops.sql
-- Phase 4 Security, Tenant Settings, and ML/Engine Events
-- ============================================================
create extension if not exists "uuid-ossp";
-- ─── TENANT SETTINGS ─────────────────────────────────────────
create table if not exists tenant_settings (
    tenant_id uuid primary key references tenants(id) on delete cascade,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    -- Risk & scoring configuration
    target_irr numeric default 18.0,
    min_dscr numeric default 1.25,
    max_ltv numeric default 0.75,
    risk_tolerance text default 'moderate',
    -- 'conservative' | 'moderate' | 'aggressive'
    -- Security preferences
    mfa_required boolean default true,
    ip_allowlist cidr [] default '{}',
    -- Feature flags
    enable_predictive_economy boolean default true,
    enable_news_signals boolean default true,
    enable_ml_scoring boolean default false
);
-- ─── SECURITY EVENTS (AUDIT TRAIL) ───────────────────────────
create table if not exists security_events (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    tenant_id uuid references tenants(id) on delete
    set null,
        user_id uuid,
        event_type text not null,
        -- 'login_success' | 'login_failure' | 'mfa_challenge' | 'api_access_denied' | 'role_change'
        ip_address inet,
        user_agent text,
        metadata jsonb
);
create index if not exists idx_security_events_tenant_time on security_events (tenant_id, created_at desc);
-- ─── RISK ENGINE EVENTS ───────────────────────────────────────
create table if not exists risk_events (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    tenant_id uuid references tenants(id) on delete
    set null,
        project_id uuid references projects(id) on delete cascade,
        engine_version text default 'v0',
        inputs jsonb not null,
        output jsonb not null
);
create index if not exists idx_risk_events_project_time on risk_events (project_id, created_at desc);
-- ─── SCORING EVENTS ──────────────────────────────────────────
create table if not exists scoring_events (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    tenant_id uuid references tenants(id) on delete
    set null,
        project_id uuid references projects(id) on delete cascade,
        model_name text not null,
        model_version text not null,
        inputs jsonb not null,
        output jsonb not null
);
create index if not exists idx_scoring_events_project_time on scoring_events (project_id, created_at desc);
-- ─── MODEL REGISTRY ──────────────────────────────────────────
create table if not exists models (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    name text not null,
    -- 'deal_scoring', 'risk_delay', etc.
    version text not null,
    -- 'v1', 'v2', etc.
    status text not null default 'staging',
    -- 'staging' | 'production' | 'retired'
    metrics jsonb,
    -- {"auc": 0.82, "rmse": 0.14, ...}
    params jsonb,
    -- hyperparameters or configuration
    deployed_at timestamptz,
    retired_at timestamptz
);
create unique index if not exists idx_models_name_version on models (name, version);
-- ─── MODEL ALERTS ─────────────────────────────────────────────
create table if not exists model_alerts (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamptz default now(),
    model_name text not null,
    model_version text not null,
    alert_type text not null,
    -- 'performance_drop' | 'data_drift' | 'stability_issue'
    severity text not null,
    -- 'info' | 'warning' | 'critical'
    message text not null,
    details jsonb
);
create index if not exists idx_model_alerts_model_time on model_alerts (model_name, created_at desc);