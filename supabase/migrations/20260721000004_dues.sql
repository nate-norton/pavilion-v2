-- Phase 2 — dues domain. Per-unit assessment statements (the member's dues
-- history + the one currently actionable). Community-scoped; a member reads
-- their own unit's statements, the board reads all in the community and writes.

create or replace function private.owns_unit(u uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    join public.profiles p on p.id = m.profile_id
    where m.unit_id = u and p.user_id = auth.uid() and m.status = 'active'
  );
$$;

create table public.dues_statements (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  unit_id      uuid not null references public.units(id) on delete cascade,
  period       text not null,                       -- 'July 2026'
  period_label text not null default '',            -- 'July'
  amount_cents integer not null,
  status       text not null default 'due',         -- due | paid | past_due | plan
  status_label text not null default '',            -- 'Due Jul 3' / 'Paid Jun 3 · #P-2168'
  card_title   text not null default '',            -- Today card headline (current only)
  card_sub     text not null default '',            -- Today card subline (current only)
  card_btn     text not null default '',            -- Today card button (current only)
  confirmation text,
  is_current   boolean not null default false,      -- the actionable statement for Today
  sort_order   integer not null default 0,          -- history ordering (newest first)
  created_at   timestamptz not null default now()
);
create index dues_statements_unit_idx on public.dues_statements (unit_id, sort_order);
create index dues_statements_community_idx on public.dues_statements (community_id);

alter table public.dues_statements enable row level security;

create policy dues_statements_read on public.dues_statements
  for select using (private.owns_unit(unit_id) or private.is_board(community_id));

create policy dues_statements_write on public.dues_statements
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));
