-- Analyses table
create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  perception jsonb,
  experience text,
  confidence numeric,
  user_id uuid null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_analyses_created_at on public.analyses (created_at desc);
create index if not exists idx_analyses_confidence on public.analyses (confidence);

-- Bucket (manual step if not existing): images
-- In Supabase dashboard: create storage bucket named 'images' (public)

-- Row Level Security (enable then policies)
alter table public.analyses enable row level security;

-- Simple read policy (public feed)
create policy if not exists "Public read analyses" on public.analyses
  for select using ( true );

-- Insert policy (authenticated or anon for MVP)
create policy if not exists "Insert analyses" on public.analyses
  for insert with check ( true );
