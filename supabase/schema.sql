-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Transactions Table
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  description text not null,
  merchant text,
  amount numeric(10, 2) not null,
  category text,
  confidence_score numeric(3, 2), -- 0.00 to 1.00
  is_anomaly boolean default false,
  created_at timestamp with time zone default now()
);

-- Reports Table
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  period text not null, -- e.g., "2023-10"
  total_spent numeric(12, 2) not null,
  summary text,
  pdf_url text,
  created_at timestamp with time zone default now()
);

-- Execution Logs Table
create table if not exists execution_logs (
  id uuid primary key default uuid_generate_v4(),
  workflow_name text not null,
  status text not null, -- 'success', 'error', 'running'
  error_message text,
  timestamp timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table transactions enable row level security;
alter table reports enable row level security;
alter table execution_logs enable row level security;

-- Create policies (For portfolio/demo, allowing public read/write might be acceptable but let's stick to service role or authenticated users. 
-- For now, we'll create policies that allow access to authenticated users, assuming Supabase Auth is used, or we can leave it open for anonymous for the sake of the n8n integration ease if not using service key).

-- Using Service Role for n8n is best practice.
-- For Frontend (Dashboard), we assume user is authenticated or we can make it public for read-only demo.
-- Let's make it public read for demo purposes, and write via service role (bypasses RLS) or specific policy.

create policy "Enable read access for all users" on transactions
for select using (true);

create policy "Enable read access for all users" on reports
for select using (true);

create policy "Enable read access for all users" on execution_logs
for select using (true);

-- Indexes for performance
create index idx_transactions_date on transactions(date);
create index idx_transactions_category on transactions(category);
create index idx_reports_period on reports(period);