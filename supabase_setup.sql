-- Run this once in Supabase SQL Editor.

create table if not exists public.challenge_state (
  id bigint primary key,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.challenge_state enable row level security;

-- Ensure anonymous browser clients can use policies below.
grant select, insert, update on table public.challenge_state to anon;

-- Recreate policies safely for repeatable setup runs.
drop policy if exists "challenge_state_public_read" on public.challenge_state;
drop policy if exists "challenge_state_public_write" on public.challenge_state;
drop policy if exists "challenge_state_public_update" on public.challenge_state;

-- Public read (for crew clients).
create policy "challenge_state_public_read"
on public.challenge_state
for select
to anon
using (true);

-- Public write for id=1 state row used by this site.
create policy "challenge_state_public_write"
on public.challenge_state
for insert
to anon
with check (id = 1);

create policy "challenge_state_public_update"
on public.challenge_state
for update
to anon
using (id = 1)
with check (id = 1);

-- Seed initial row used by the app.
insert into public.challenge_state (id, state)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- Crew login aliases (name-based passwords -> crew codes).
create table if not exists public.crew_login_profiles (
  crew_code text primary key,
  aliases text[] not null default '{}',
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.crew_login_profiles enable row level security;
grant select on table public.crew_login_profiles to anon;

drop policy if exists "crew_login_profiles_public_read" on public.crew_login_profiles;
create policy "crew_login_profiles_public_read"
on public.crew_login_profiles
for select
to anon
using (active = true);

insert into public.crew_login_profiles (crew_code, aliases, active) values
  ('160698', array['josh', 'joshua', 'joshua moore', 'jm'], true),
  ('170997', array['ross', 'ross wightman', 'rw'], true),
  ('230997', array['emmanuel', 'emmanuel pascual', 'ep'], true),
  ('270298', array['kelan', 'kelan boylan', 'kb'], true),
  ('120398', array['jack', 'jack doherty', 'jd'], true),
  ('240598', array['ciaran', 'ciaran stone', 'cs'], true)
on conflict (crew_code) do update
set aliases = excluded.aliases,
    active = excluded.active,
    updated_at = now();
