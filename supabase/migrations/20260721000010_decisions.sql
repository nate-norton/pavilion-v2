-- Phase 2 — decisions log. Every board decision, visible to every member.
-- Board writes rows (in-app tooling later); members read. Empty for a fresh
-- community, so the HOA tab shows an empty decisions log until the board logs one.

create table public.decisions (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  date_label   text not null,               -- 'JUN 18'
  text         text not null,
  pill_label   text not null default '',    -- 'Passed 91–22'
  passed       boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index decisions_community_idx on public.decisions (community_id, sort_order);

alter table public.decisions enable row level security;

create policy decisions_read on public.decisions
  for select using (private.is_member(community_id));
create policy decisions_write on public.decisions
  for insert with check (private.is_board(community_id));
create policy decisions_update on public.decisions
  for update using (private.is_board(community_id)) with check (private.is_board(community_id));
