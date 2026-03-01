-- COMPREHENSIVE SCHEMA FIX
-- Run this in Supabase SQL Editor to restore all missing tables and dependencies.
-- 1. ENUMS (Safe)
do $$ begin create type user_role as enum ('ADMIN_INTERNAL', 'CLIENT_SAAS', 'VIEWER');
exception
when duplicate_object then null;
end $$;
do $$ begin create type deal_stage as enum (
    'sourcing',
    'screening',
    'due_diligence',
    'committee',
    'closing',
    'asset_mgmt',
    'dead',
    'sold'
);
exception
when duplicate_object then null;
end $$;
do $$ begin create type subscription_tier as enum ('FREE', 'PRO', 'PRO_PLUS');
exception
when duplicate_object then null;
end $$;
do $$ begin create type intel_type as enum (
    'ZONING',
    'MARKET',
    'RENT_COMP',
    'COST',
    'ABSORPTION',
    'DEMOGRAPHICS',
    'OTHER'
);
exception
when duplicate_object then null;
end $$;
-- 2. TABLES
-- A. User Profiles (Parent)
create table if not exists public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role user_role not null default 'CLIENT_SAAS',
    subscription_tier subscription_tier not null default 'FREE',
    org_id uuid null,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_price_id text,
    stripe_current_period_end timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-- B. Deals (Child)
create table if not exists public.deals (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    project_name text not null,
    location text not null,
    asset_type text not null,
    stage deal_stage not null default 'sourcing',
    internal_only boolean not null default false,
    acquisition_price numeric default 0,
    renovation_cost numeric default 0,
    projected_value numeric default 0,
    capital_required numeric default 0,
    capital_raised numeric default 0,
    projected_profit numeric generated always as (
        projected_value - (acquisition_price + renovation_cost)
    ) stored,
    tags text [] default '{}',
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-- C. History
create table if not exists public.deal_stage_history (
    id uuid primary key default uuid_generate_v4(),
    deal_id uuid not null references public.deals(id) on delete cascade,
    from_stage deal_stage,
    to_stage deal_stage not null,
    changed_by uuid not null references auth.users(id),
    changed_at timestamptz not null default now()
);
-- D. Intel
create table if not exists public.intel_records (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.user_profiles(id) on delete cascade,
    record_type intel_type not null,
    title text not null,
    state text not null default 'FL',
    county text,
    city text,
    zipcode text,
    geo_tags text [] default '{}',
    asset_tags text [] default '{}',
    metrics jsonb default '{}',
    source text,
    source_date date,
    notes text,
    internal_only boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
-- E. Links
create table if not exists public.deal_intel_links (
    id uuid primary key default uuid_generate_v4(),
    deal_id uuid not null references public.deals(id) on delete cascade,
    intel_id uuid not null references public.intel_records(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(deal_id, intel_id)
);
-- 3. ENABLE RLS
alter table public.user_profiles enable row level security;
alter table public.deals enable row level security;
alter table public.deal_stage_history enable row level security;
alter table public.intel_records enable row level security;
alter table public.deal_intel_links enable row level security;
-- 4. BACKFILL PROFILES (Critical Fix)
-- Ensure all existing auth users have a profile so they can create deals
insert into public.user_profiles (id, role, subscription_tier)
select id,
    'CLIENT_SAAS',
    'FREE'
from auth.users on conflict (id) do nothing;
-- 5. POLICIES (Idempotent Re-creation)
-- Profiles
drop policy if exists "Users can view own profile" on public.user_profiles;
create policy "Users can view own profile" on public.user_profiles for
select using (auth.uid() = id);
drop policy if exists "Users can update own basic details" on public.user_profiles;
create policy "Users can update own basic details" on public.user_profiles for
update using (auth.uid() = id);
-- Deals
drop policy if exists "Users view own deals" on public.deals;
create policy "Users view own deals" on public.deals for
select using (user_id = auth.uid());
-- simplified for robustness
drop policy if exists "Users insert own deals" on public.deals;
create policy "Users insert own deals" on public.deals for
insert with check (user_id = auth.uid());
drop policy if exists "Users update own deals" on public.deals;
create policy "Users update own deals" on public.deals for
update using (user_id = auth.uid());
drop policy if exists "Users delete own deals" on public.deals;
create policy "Users delete own deals" on public.deals for delete using (user_id = auth.uid());
-- History
drop policy if exists "View history for accessible deals" on public.deal_stage_history;
create policy "View history for accessible deals" on public.deal_stage_history for
select using (
        exists (
            select 1
            from public.deals
            where deals.id = deal_stage_history.deal_id
                and deals.user_id = auth.uid()
        )
    );
drop policy if exists "Insert history" on public.deal_stage_history;
create policy "Insert history" on public.deal_stage_history for
insert with check (auth.uid() = changed_by);
-- Intel
drop policy if exists "Users view own intel" on public.intel_records;
create policy "Users view own intel" on public.intel_records for
select using (user_id = auth.uid());
drop policy if exists "Users CRUD own intel" on public.intel_records;
create policy "Users CRUD own intel" on public.intel_records for all using (user_id = auth.uid());
-- 6. TRIGGERS
-- Timestamp Func
create or replace function update_updated_at() returns trigger as $$ begin new.updated_at = now();
return new;
end;
$$ language plpgsql;
drop trigger if exists update_deals_timestamp on public.deals;
create trigger update_deals_timestamp before
update on public.deals for each row execute procedure update_updated_at();
drop trigger if exists update_profiles_timestamp on public.user_profiles;
create trigger update_profiles_timestamp before
update on public.user_profiles for each row execute procedure update_updated_at();
-- New User Trigger
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.user_profiles (id, role, subscription_tier)
values (new.id, 'CLIENT_SAAS', 'FREE') on conflict (id) do nothing;
return new;
end;
$$ language plpgsql security definer;
-- Re-attach trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- History Trigger
create or replace function track_deal_stage_changes() returns trigger as $$ begin if (
        old.stage is distinct
        from new.stage
    ) then
insert into public.deal_stage_history(deal_id, from_stage, to_stage, changed_by)
values (new.id, old.stage, new.stage, auth.uid());
end if;
return new;
end;
$$ language plpgsql security definer;
drop trigger if exists on_deal_stage_change on public.deals;
create trigger on_deal_stage_change
after
update on public.deals for each row execute procedure track_deal_stage_changes();