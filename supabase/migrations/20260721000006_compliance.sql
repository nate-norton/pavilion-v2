-- Phase 2 — compliance domain: courtesy notices / violations and one-time
-- special assessments. Both are per-unit; a member sees their own, the board
-- sees all in the community and writes them. Empty for a fresh member.

create table public.violations (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  unit_id      uuid not null references public.units(id) on delete cascade,
  title        text not null,                    -- 'Courtesy notice: trash bins'
  sub          text not null default '',         -- 'No fee · auto-closes if fixed by Jul 8'
  status       text not null default 'open',     -- open | fixed | resolved
  created_at   timestamptz not null default now()
);
create index violations_unit_idx on public.violations (unit_id, status);

create table public.special_assessments (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  unit_id      uuid not null references public.units(id) on delete cascade,
  title        text not null,                    -- 'Roof-reserve assessment · $450'
  sub          text not null default '',         -- 'Due Aug 1 · pay now or split into 3'
  status       text not null default 'open',     -- open | paid
  created_at   timestamptz not null default now()
);
create index special_assessments_unit_idx on public.special_assessments (unit_id, status);

alter table public.violations enable row level security;
alter table public.special_assessments enable row level security;

create policy violations_read on public.violations
  for select using (private.owns_unit(unit_id) or private.is_board(community_id));
create policy violations_write on public.violations
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));

create policy special_assessments_read on public.special_assessments
  for select using (private.owns_unit(unit_id) or private.is_board(community_id));
create policy special_assessments_write on public.special_assessments
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));
