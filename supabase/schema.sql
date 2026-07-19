-- supabase/schema.sql
-- Spin to Lead — database schema
-- Tables: questions, participants. Pairs are stored as JSONB on questions.

create extension if not exists "pgcrypto";

-- ── questions ─────────────────────────────────────────────────────────
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('quiz', 'guess_leader', 'match_pair', 'leadership_scenario')),
  question_text text not null,
  image_url text,
  options jsonb,          -- string[] for multiple-choice categories
  correct_answer text,
  pairs jsonb,            -- { left, right }[] for match_pair
  explanation text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists questions_category_active_idx
  on public.questions (category, is_active);

-- keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists questions_set_updated_at on public.questions;
create trigger questions_set_updated_at
  before update on public.questions
  for each row execute function public.set_updated_at();

-- ── participants ──────────────────────────────────────────────────────
create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text,
  category text not null check (category in ('quiz', 'guess_leader', 'match_pair', 'leadership_scenario')),
  question_id uuid references public.questions (id) on delete set null,
  is_correct boolean not null default false,
  score integer not null default 0 check (score >= 0),
  played_at timestamptz not null default now()
);

create index if not exists participants_played_at_idx
  on public.participants (played_at desc);
create index if not exists participants_score_idx
  on public.participants (score desc);

-- ── Row Level Security ────────────────────────────────────────────────
-- Event-kiosk trust model: the admin panel is gated client-side, so the
-- anon role can read and write questions and record plays. Tighten these
-- policies if you adopt Supabase Auth for admins.

alter table public.questions enable row level security;
alter table public.participants enable row level security;

drop policy if exists "questions_select" on public.questions;
create policy "questions_select" on public.questions
  for select to anon, authenticated using (true);

drop policy if exists "questions_insert" on public.questions;
create policy "questions_insert" on public.questions
  for insert to anon, authenticated with check (true);

drop policy if exists "questions_update" on public.questions;
create policy "questions_update" on public.questions
  for update to anon, authenticated using (true) with check (true);

drop policy if exists "questions_delete" on public.questions;
create policy "questions_delete" on public.questions
  for delete to anon, authenticated using (true);

drop policy if exists "participants_select" on public.participants;
create policy "participants_select" on public.participants
  for select to anon, authenticated using (true);

drop policy if exists "participants_insert" on public.participants;
create policy "participants_insert" on public.participants
  for insert to anon, authenticated with check (true);
