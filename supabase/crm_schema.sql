-- CRM Schema Expansion (Phase 10)
-- 1. Contacts Table
create table if not exists contacts (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid,
    -- Mandatory for multi-tenancy in live DB
    first_name text,
    last_name text,
    email text,
    phone text,
    type text check (
        type in ('investor', 'client', 'vendor', 'lead', 'broker')
    ),
    status text check (status in ('active', 'inactive', 'prospect')) default 'prospect',
    tags text [],
    -- Array of tags e.g. ['accredited', 'fl-resident']
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 2. Businesses Table (Partners, Lenders, etc.)
create table if not exists businesses (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    industry text,
    -- e.g. 'Lender', 'Contractor', 'Legal'
    website text,
    address text,
    primary_contact_id uuid references contacts(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- 3. Deal Contacts (Many-to-Many Link)
create table if not exists deal_contacts (
    id uuid default uuid_generate_v4() primary key,
    deal_id uuid references deals(id) on delete cascade,
    contact_id uuid references contacts(id) on delete cascade,
    role text,
    -- e.g. 'investor', 'broker', 'attorney'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(deal_id, contact_id)
);
-- Enable RLS
alter table contacts enable row level security;
alter table businesses enable row level security;
alter table deal_contacts enable row level security;
-- Policies (Public for now, or Authenticated)
create policy "Allow all access for authenticated users" on contacts for all using (auth.role() = 'authenticated');
create policy "Allow all access for authenticated users" on businesses for all using (auth.role() = 'authenticated');
create policy "Allow all access for authenticated users" on deal_contacts for all using (auth.role() = 'authenticated');
-- Realtime
alter publication supabase_realtime
add table contacts;
alter publication supabase_realtime
add table businesses;
alter publication supabase_realtime
add table deal_contacts;