-- Phase 2 — architectural review (ARC) requests, per unit. A member sees and
-- submits their own unit's requests; the board sees all in the community and
-- decides them. Empty for a fresh member. Timeline steps are stored as jsonb.

create table public.arc_requests (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  unit_id      uuid not null references public.units(id) on delete cascade,
  ref          text not null,                    -- '#A-118'
  title        text not null,                    -- 'Backyard pergola'
  status       text not null default 'submitted',-- submitted | in_review | approved | declined
  approved     boolean not null default false,
  status_label text not null default '',         -- 'Approved' / 'In review'
  steps        jsonb not null default '[]'::jsonb,-- [{label, state}]
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);
create index arc_requests_unit_idx on public.arc_requests (unit_id, sort_order);
create index arc_requests_community_idx on public.arc_requests (community_id);

alter table public.arc_requests enable row level security;

create policy arc_requests_read on public.arc_requests
  for select using (private.owns_unit(unit_id) or private.is_board(community_id));
create policy arc_requests_write on public.arc_requests
  for all using (private.owns_unit(unit_id) or private.is_board(community_id))
  with check (private.owns_unit(unit_id) or private.is_board(community_id));
