-- Phase 2 — reports / triage domain. Residents privately report issues; the
-- board triages them (create ticket, assign vendor, resolve). Community-scoped:
-- a member reads/creates their own reports, the board reads all + acts on them.
-- Empty for a fresh community, so a new board lands on an empty triage queue.

create table public.reports (
  id                 uuid primary key default gen_random_uuid(),
  community_id       uuid not null references public.communities(id) on delete cascade,
  reporter_profile_id uuid references public.profiles(id) on delete set null,
  title              text not null,
  reporter_label     text not null default '',   -- 'Reported privately by #31 · 2h ago'
  kind               text not null default 'issue',
  status             text not null default 'open',-- open | ticketed | assigned | resolved
  ref                text not null default '',    -- '#M-88'
  vendor             text not null default '',
  created_at         timestamptz not null default now()
);
create index reports_community_idx on public.reports (community_id, status);

alter table public.reports enable row level security;

create policy reports_read on public.reports
  for select using (
    private.is_board(community_id) or reporter_profile_id = private.current_profile_id()
  );
create policy reports_insert on public.reports
  for insert with check (
    private.is_member(community_id) and reporter_profile_id = private.current_profile_id()
  );
create policy reports_update on public.reports
  for update using (private.is_board(community_id)) with check (private.is_board(community_id));
