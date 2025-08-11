-- Feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.analyses(id) on delete cascade,
  feedback text not null,
  user_id uuid null,
  created_at timestamptz not null default now()
);

-- Likes table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid references public.analyses(id) on delete cascade,
  user_id uuid null,
  created_at timestamptz not null default now(),
  unique(analysis_id, user_id)
);

create index if not exists idx_feedback_analysis on public.feedback (analysis_id);
create index if not exists idx_likes_analysis on public.likes (analysis_id);

alter table public.feedback enable row level security;
alter table public.likes enable row level security;

create policy if not exists "Public read feedback" on public.feedback for select using ( true );
create policy if not exists "Public read likes" on public.likes for select using ( true );
create policy if not exists "Insert feedback" on public.feedback for insert with check ( true );
create policy if not exists "Insert likes" on public.likes for insert with check ( true );
