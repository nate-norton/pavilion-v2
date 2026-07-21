-- Phase 2 — core multi-tenant schema + RLS foundation.
-- Every domain row is scoped to a community_id; access is driven by memberships.
-- Role model (locked 2026-07-20): resident + board only.
-- RLS helpers live in a non-exposed `private` schema so they can't be called
-- via the REST API (PostgREST only exposes `public`), while policies still use them.

create extension if not exists pgcrypto;

-- ── Tenant root ──────────────────────────────────────────────────────────────
create table public.communities (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  brand      jsonb not null default '{}'::jsonb,   -- per-community theme tokens
  settings   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── People (optionally linked to an auth user) ───────────────────────────────
create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid unique references auth.users(id) on delete set null,
  name       text not null,
  initial    text not null default '',
  color      text not null default '#1A3352',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- ── Homes within a community ─────────────────────────────────────────────────
create table public.units (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  label        text not null,                        -- e.g. "#27 Alder Way"
  created_at   timestamptz not null default now(),
  unique (community_id, label)
);

-- ── Membership drives roles & access (replaces the demo's state.role) ────────
create type public.member_role as enum ('resident', 'board');

create table public.memberships (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  community_id uuid not null references public.communities(id) on delete cascade,
  unit_id      uuid references public.units(id) on delete set null,
  role         public.member_role not null default 'resident',
  status       text not null default 'active',
  created_at   timestamptz not null default now(),
  unique (profile_id, community_id)
);

create index memberships_community_idx on public.memberships (community_id);
create index memberships_profile_idx on public.memberships (profile_id);
create index units_community_idx on public.units (community_id);

-- ── RLS helpers in a private (non-API-exposed) schema ────────────────────────
create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

create or replace function private.current_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where user_id = auth.uid() limit 1;
$$;

create or replace function private.is_member(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    join public.profiles p on p.id = m.profile_id
    where m.community_id = c and p.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function private.is_board(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    join public.profiles p on p.id = m.profile_id
    where m.community_id = c and p.user_id = auth.uid()
      and m.role = 'board' and m.status = 'active'
  );
$$;

create or replace function private.shares_community(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.memberships mine
    join public.profiles me on me.id = mine.profile_id
    join public.memberships theirs on theirs.community_id = mine.community_id
    where me.user_id = auth.uid() and theirs.profile_id = target
  );
$$;

-- ── Enable RLS + policies ────────────────────────────────────────────────────
alter table public.communities enable row level security;
alter table public.profiles    enable row level security;
alter table public.units       enable row level security;
alter table public.memberships enable row level security;

create policy communities_read on public.communities
  for select using (private.is_member(id));

create policy profiles_read on public.profiles
  for select using (user_id = auth.uid() or private.shares_community(id));
create policy profiles_update_own on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy units_read on public.units
  for select using (private.is_member(community_id));

create policy memberships_read on public.memberships
  for select using (private.is_member(community_id));
