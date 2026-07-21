-- Phase 2 — reservations. One active amenity booking per household drives the
-- Reserve screen and the Today booking card. Member books/cancels their own;
-- the board can see and manage all of the community's bookings.
--
-- NOT YET APPLIED. Until it is, live booking writes no-op and the Reserve
-- screen keeps its empty state.

create table public.reservations (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  amenity      text not null,
  day_label    text not null,
  slot_label   text not null,
  hours        int  not null default 1,
  summary      text not null default '',   -- 'Clubhouse · Sat · 4–6 PM'
  status       text not null default 'booked',  -- booked | cancelled
  created_at   timestamptz not null default now()
);
create index reservations_profile_idx on public.reservations (profile_id, status);
create index reservations_community_idx on public.reservations (community_id, status);

alter table public.reservations enable row level security;

create policy reservations_read on public.reservations
  for select using (
    profile_id = private.current_profile_id() or private.is_board(community_id)
  );
create policy reservations_insert on public.reservations
  for insert with check (
    profile_id = private.current_profile_id() and private.is_member(community_id)
  );
create policy reservations_update on public.reservations
  for update using (
    profile_id = private.current_profile_id() or private.is_board(community_id)
  ) with check (
    profile_id = private.current_profile_id() or private.is_board(community_id)
  );
