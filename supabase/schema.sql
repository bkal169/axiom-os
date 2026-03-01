-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. ENUMS
create type user_role as enum ('ADMIN_INTERNAL', 'CLIENT_SAAS', 'VIEWER');
create type deal_stage as enum ('sourcing', 'screening', 'due_diligence', 'committee', 'closing', 'asset_mgmt', 'dead', 'sold');
create type subscription_tier as enum ('FREE', 'PRO', 'PRO_PLUS');
create type intel_type as enum ('ZONING', 'MARKET', 'RENT_COMP', 'COST', 'ABSORPTION', 'DEMOGRAPHICS', 'OTHER');

-- 2. TABLES

-- Profiles (extends auth.users)
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'CLIENT_SAAS',
  subscription_tier subscription_tier not null default 'FREE',
  org_id uuid null, -- Reserved for future multi-tenancy
  
  -- Stripe Integration
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  stripe_current_period_end timestamptz,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deals
create table public.deals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  project_name text not null,
  location text not null,
  asset_type text not null,
  stage deal_stage not null default 'sourcing',
  internal_only boolean not null default false,
  
  -- Metrics
  acquisition_price numeric default 0,
  renovation_cost numeric default 0,
  projected_value numeric default 0,
  capital_required numeric default 0,
  capital_raised numeric default 0,
  
  -- Computed/Cache (optional, good for sorting)
  projected_profit numeric generated always as (projected_value - (acquisition_price + renovation_cost)) stored,
  
  tags text[] default '{}',
  notes text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deal Stage History (Audit Trail)
create table public.deal_stage_history (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  from_stage deal_stage,
  to_stage deal_stage not null,
  changed_by uuid not null references auth.users(id),
  changed_at timestamptz not null default now()
);

-- Intel Records (Data Layer)
create table public.intel_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.user_profiles(id) on delete cascade, -- Creator
  record_type intel_type not null,
  title text not null,
  state text not null default 'FL',
  county text,
  city text,
  zipcode text,
  
  geo_tags text[] default '{}',
  asset_tags text[] default '{}',
  metrics jsonb default '{}',
  
  source text,
  source_date date,
  notes text,
  internal_only boolean not null default false,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deal <-> Intel Link (Many-to-Many)
create table public.deal_intel_links (
  id uuid primary key default uuid_generate_v4(),
  deal_id uuid not null references public.deals(id) on delete cascade,
  intel_id uuid not null references public.intel_records(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(deal_id, intel_id)
);

-- 3. RLS POLICIES

alter table public.user_profiles enable row level security;
alter table public.deals enable row level security;
alter table public.deal_stage_history enable row level security;
alter table public.intel_records enable row level security;
alter table public.deal_intel_links enable row level security;

-- PROFILES
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own basic details"
  on public.user_profiles for update
  using (auth.uid() = id);
  -- Note: Role/Tier updates blocked by Trigger or API logic in real app.

-- DEALS
-- Rule: SaaS sees OWN deals where internal_only=false (defensive).
-- Admin sees OWN deals (can include internal_only).
-- *Wait*, if SaaS user creates a deal, they OWN it. They should see it.
-- SaaS users cannot create internal_only=true deals (enforced below).
-- So: Users see their own deals. 
-- BUT: if an Admin transfers a deal to a SaaS user (edge case), and it's internal?
-- Let's stick to: Users see deals where user_id = auth.uid().
-- AND if SaaS, enforce internal_only = false just in case.

create policy "Users view own deals"
  on public.deals for select
  using (
    user_id = auth.uid() 
    AND (
      internal_only = false 
      OR exists (
        select 1 from public.user_profiles 
        where id = auth.uid() and role = 'ADMIN_INTERNAL'
      )
    )
  );

create policy "Users insert own deals"
  on public.deals for insert
  with check (
    user_id = auth.uid()
    AND (
      internal_only = false
      OR exists (
        select 1 from public.user_profiles
        where id = auth.uid() and role = 'ADMIN_INTERNAL'
      )
    )
  );

create policy "Users update own deals"
  on public.deals for update
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    AND (
      internal_only = false
      OR exists (
        select 1 from public.user_profiles
        where id = auth.uid() and role = 'ADMIN_INTERNAL'
      )
    )
  );

create policy "Users delete own deals"
  on public.deals for delete
  using (user_id = auth.uid());

-- HISTORY
create policy "View history for accessible deals"
  on public.deal_stage_history for select
  using (
    exists (
      select 1 from public.deals
      where deals.id = deal_stage_history.deal_id
      AND deals.user_id = auth.uid() -- Enforce ownership via deal
      AND (
         deals.internal_only = false 
         OR exists (select 1 from public.user_profiles where id = auth.uid() and role = 'ADMIN_INTERNAL')
      )
    )
  );

create policy "Insert history"
  on public.deal_stage_history for insert
  with check (auth.uid() = changed_by);

-- INTEL RECORDS
-- Rule: Users see their OWN records.
-- (Future: Public shared library? For now, personal vault).
create policy "Users view own intel"
  on public.intel_records for select
  using (
    user_id = auth.uid()
    AND (
      internal_only = false
      OR exists (select 1 from public.user_profiles where id = auth.uid() and role = 'ADMIN_INTERNAL')
    )
  );

create policy "Users CRUD own intel"
  on public.intel_records for all
  using (user_id = auth.uid());

-- LINKS
create policy "Users view links"
  on public.deal_intel_links for select
  using (
    exists (
      select 1 from public.deals
      where deals.id = deal_deal_intel_links.deal_id
      AND deals.user_id = auth.uid()
    )
  );

create policy "Users insert links"
  on public.deal_intel_links for insert
  with check (
    exists (
      select 1 from public.deals
      where deals.id = deal_id
      AND deals.user_id = auth.uid()
    )
    AND exists (
      select 1 from public.intel_records
      where intel_records.id = intel_id
      AND intel_records.user_id = auth.uid()
    )
  );
  
 create policy "Users delete links"
  on public.deal_intel_links for delete
  using (
    exists (
      select 1 from public.deals
      where deals.id = deal_id
      AND deals.user_id = auth.uid()
    )
  );

-- 4. HANDLERS AND TRIGGERS

-- Auto-create profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, role, subscription_tier)
  values (new.id, 'CLIENT_SAAS', 'FREE');
  return new;
end;
$$ language plpgsql security definer;

-- Auto-timestamp
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_deals_timestamp
  before update on public.deals
  for each row execute procedure update_updated_at();

create trigger update_profiles_timestamp
  before update on public.user_profiles
  for each row execute procedure update_updated_at();

-- History Logic
create or replace function track_deal_stage_changes()
returns trigger as $$
begin
  if (old.stage is distinct from new.stage) then
    insert into public.deal_stage_history(deal_id, from_stage, to_stage, changed_by)
    values (new.id, old.stage, new.stage, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_deal_stage_change
  after update on public.deals
  for each row execute procedure track_deal_stage_changes();
