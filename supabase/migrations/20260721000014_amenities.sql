-- Phase 2 — amenities. The community's bookable spaces drive the Reserve tab.
-- Members read; the board manages the list. Empty for a fresh community (the
-- Reserve tab shows its empty state until the board adds amenities).

create table public.amenities (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name         text not null,
  sub          text not null default '',       -- 'Up to 8 guests · 2-hr blocks'
  icon         text not null default 'ph-fill ph-buildings',
  rules        text not null default '',
  avail_label  text not null default 'Available today',
  occ_label    text not null default '',
  sort_order   int not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
create index amenities_community_idx on public.amenities (community_id, sort_order);

alter table public.amenities enable row level security;

create policy amenities_read on public.amenities
  for select using (private.is_member(community_id));
create policy amenities_write on public.amenities
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));
