-- Founder requests. Pavilion is invite-only, so someone who signs in with no
-- community and wants to bring their HOA on can ask here instead of finding
-- an email address. Rows are reviewed by hand; founding still happens via
-- found_community() (see docs/FOUNDING.md). A person can read their own
-- requests (so the screen can say "we got it") and insert one; nobody else
-- can see them through the API.
create table public.community_requests (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  email          text not null,
  requester_name text not null,
  community_name text not null,
  homes          integer,
  note           text not null default '',
  status         text not null default 'pending',   -- pending | founded | declined
  created_at     timestamptz not null default now()
);
create index community_requests_profile on public.community_requests (profile_id);

alter table public.community_requests enable row level security;
create policy community_requests_own_read on public.community_requests
  for select using (profile_id = private.current_profile_id());
create policy community_requests_own_insert on public.community_requests
  for insert with check (profile_id = private.current_profile_id());
