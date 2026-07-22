-- Phase 3 — enrichment schema. One migration carrying the depth pass for
-- every domain in docs/ENRICHMENT.md (payments and notifications parked):
-- storage/attachments, report triage depth, ARC decisions, board-issued
-- violations, documents, polls v2, amenity config, feed depth, event RSVPs,
-- profile editing, member/unit admin, invite codes, group lifecycle,
-- messaging depth, board topics, meetings, and an audit log.

-- ── 1. Storage: private community-scoped media bucket ─────────────────────
-- Paths are <community_id>/<domain>/<uuid>.<ext>; membership of the leading
-- folder's community gates read + write, board (or uploader) can delete.
insert into storage.buckets (id, name, public) values ('media', 'media', false)
on conflict (id) do nothing;

create policy media_read on storage.objects for select to authenticated
  using (bucket_id = 'media' and private.is_member(((storage.foldername(name))[1])::uuid));
create policy media_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and private.is_member(((storage.foldername(name))[1])::uuid));
create policy media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media'
    and (owner_id = (select auth.uid())::text
         or private.is_board(((storage.foldername(name))[1])::uuid)));

-- ── 2. Reports: urgency, location, notes, photos, comment thread ──────────
alter table public.reports
  add column urgency     text not null default 'normal',   -- low | normal | urgent
  add column location    text not null default '',
  add column board_notes text not null default '',
  add column photos      text[] not null default '{}';

create table public.report_comments (
  id                uuid primary key default gen_random_uuid(),
  report_id         uuid not null references public.reports(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  body              text not null,
  created_at        timestamptz not null default now()
);
create index report_comments_report_idx on public.report_comments (report_id, created_at);
alter table public.report_comments enable row level security;
create policy report_comments_read on public.report_comments
  for select using (exists (select 1 from public.reports r where r.id = report_id
    and (private.is_board(r.community_id) or r.reporter_profile_id = private.current_profile_id())));
create policy report_comments_insert on public.report_comments
  for insert with check (author_profile_id = private.current_profile_id()
    and exists (select 1 from public.reports r where r.id = report_id
      and (private.is_board(r.community_id) or r.reporter_profile_id = private.current_profile_id())));

-- ── 3. ARC: decisions with reasons/conditions + attachments ───────────────
alter table public.arc_requests
  add column decision_note text not null default '',
  add column conditions    text not null default '',
  add column attachments   text[] not null default '{}';

-- ── 4. Violations: board-issued, severity ladder, evidence ────────────────
alter table public.violations
  add column description text not null default '',
  add column photos      text[] not null default '{}',
  add column severity    text not null default 'courtesy',  -- courtesy | warning | fine
  add column fine_cents  integer not null default 0;

-- ── 5. Documents: board-uploaded community library ────────────────────────
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  section       text not null default 'General',
  name          text not null,
  storage_path  text not null,
  size_label    text not null default '',
  updated_label text not null default '',
  created_at    timestamptz not null default now()
);
create index documents_community_idx on public.documents (community_id, section);
alter table public.documents enable row level security;
create policy documents_read on public.documents
  for select using (private.is_member(community_id));
create policy documents_write on public.documents
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));

-- ── 6. Polls v2: N options, deadline, changeable ballots ──────────────────
alter table public.votes
  add column closes_at timestamptz,
  add column kind  text not null default 'yesno',    -- yesno | options
  add column multi boolean not null default false;

create table public.vote_options (
  id       uuid primary key default gen_random_uuid(),
  vote_id  uuid not null references public.votes(id) on delete cascade,
  label    text not null,
  position integer not null default 0,
  tally    integer not null default 0
);
create index vote_options_vote_idx on public.vote_options (vote_id, position);
alter table public.vote_options enable row level security;
create policy vote_options_read on public.vote_options
  for select using (exists (select 1 from public.votes v where v.id = vote_id and private.is_member(v.community_id)));
create policy vote_options_write on public.vote_options
  for all using (exists (select 1 from public.votes v where v.id = vote_id and private.is_board(v.community_id)))
  with check (exists (select 1 from public.votes v where v.id = vote_id and private.is_board(v.community_id)));

alter table public.vote_ballots
  alter column choice set default '',
  add column option_ids uuid[] not null default '{}';

create policy vote_ballots_update on public.vote_ballots
  for update using (
    profile_id = private.current_profile_id()
    and exists (select 1 from public.votes v where v.id = vote_id and v.status = 'open')
  ) with check (profile_id = private.current_profile_id());

-- Tally trigger now handles option ballots and vote changes (update = move
-- the counts from the old choice to the new; quorum only bumps on insert).
create or replace function private.bump_vote_tally()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.votes
    set yes_count    = yes_count + (case when new.choice = 'yes' then 1 else 0 end),
        no_count     = no_count  + (case when new.choice = 'no'  then 1 else 0 end),
        quorum_count = quorum_count + 1
    where id = new.vote_id;
    update public.vote_options set tally = tally + 1 where id = any(new.option_ids);
  else
    update public.votes
    set yes_count = yes_count - (case when old.choice = 'yes' then 1 else 0 end)
                              + (case when new.choice = 'yes' then 1 else 0 end),
        no_count  = no_count  - (case when old.choice = 'no' then 1 else 0 end)
                              + (case when new.choice = 'no' then 1 else 0 end)
    where id = new.vote_id;
    update public.vote_options set tally = greatest(tally - 1, 0) where id = any(old.option_ids);
    update public.vote_options set tally = tally + 1 where id = any(new.option_ids);
  end if;
  return new;
end;
$$;

create trigger vote_ballots_tally_update
  after update on public.vote_ballots
  for each row execute function private.bump_vote_tally();

-- ── 7. Amenities: per-amenity booking configuration ───────────────────────
alter table public.amenities
  add column open_hour      integer not null default 8,
  add column close_hour     integer not null default 21,
  add column slot_minutes   integer not null default 60,
  add column capacity       integer not null default 1,
  add column max_days_ahead integer not null default 7;

-- ── 8. Feed: ownership, photos, pins, comments, reactions ─────────────────
-- Also tightens the old feed_posts_write (any member could update/delete
-- anyone's post) down to author-or-board.
alter table public.feed_posts
  add column author_profile_id uuid references public.profiles(id) on delete set null,
  add column photos text[] not null default '{}',
  add column pinned boolean not null default false;

drop policy feed_posts_write on public.feed_posts;
create policy feed_posts_insert on public.feed_posts
  for insert with check (private.is_member(community_id)
    and (author_profile_id = private.current_profile_id() or private.is_board(community_id)));
create policy feed_posts_update on public.feed_posts
  for update using (author_profile_id = private.current_profile_id() or private.is_board(community_id))
  with check (author_profile_id = private.current_profile_id() or private.is_board(community_id));
create policy feed_posts_delete on public.feed_posts
  for delete using (author_profile_id = private.current_profile_id() or private.is_board(community_id));

create table public.post_comments (
  id                uuid primary key default gen_random_uuid(),
  post_id           uuid not null references public.feed_posts(id) on delete cascade,
  author_profile_id uuid references public.profiles(id) on delete set null,
  body              text not null,
  created_at        timestamptz not null default now()
);
create index post_comments_post_idx on public.post_comments (post_id, created_at);
alter table public.post_comments enable row level security;
create policy post_comments_read on public.post_comments
  for select using (exists (select 1 from public.feed_posts p where p.id = post_id and private.is_member(p.community_id)));
create policy post_comments_insert on public.post_comments
  for insert with check (author_profile_id = private.current_profile_id()
    and exists (select 1 from public.feed_posts p where p.id = post_id and private.is_member(p.community_id)));
create policy post_comments_delete on public.post_comments
  for delete using (author_profile_id = private.current_profile_id()
    or exists (select 1 from public.feed_posts p where p.id = post_id and private.is_board(p.community_id)));

create table public.post_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.feed_posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, profile_id)
);
alter table public.post_reactions enable row level security;
create policy post_reactions_read on public.post_reactions
  for select using (exists (select 1 from public.feed_posts p where p.id = post_id and private.is_member(p.community_id)));
create policy post_reactions_write on public.post_reactions
  for all using (profile_id = private.current_profile_id())
  with check (profile_id = private.current_profile_id()
    and exists (select 1 from public.feed_posts p where p.id = post_id and private.is_member(p.community_id)));

-- ── 9. Community event RSVPs (count kept by trigger) ──────────────────────
create table public.event_rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);
alter table public.event_rsvps enable row level security;
create policy event_rsvps_read on public.event_rsvps
  for select using (exists (select 1 from public.events e where e.id = event_id and private.is_member(e.community_id)));
create policy event_rsvps_write on public.event_rsvps
  for all using (profile_id = private.current_profile_id())
  with check (profile_id = private.current_profile_id()
    and exists (select 1 from public.events e where e.id = event_id and private.is_member(e.community_id)));

create or replace function private.bump_event_going()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.events set going = going + 1 where id = new.event_id;
    return new;
  else
    update public.events set going = greatest(going - 1, 0) where id = old.event_id;
    return old;
  end if;
end;
$$;
revoke execute on function private.bump_event_going() from public, anon, authenticated;
create trigger event_rsvps_going
  after insert or delete on public.event_rsvps
  for each row execute function private.bump_event_going();

-- ── 10. Profiles: phone + directory privacy ───────────────────────────────
alter table public.profiles
  add column phone text not null default '',
  add column hide_directory boolean not null default false;

-- ── 11. Member & unit admin (board) ───────────────────────────────────────
create policy memberships_admin_update on public.memberships
  for update using (private.is_board(community_id)) with check (private.is_board(community_id));
create policy memberships_admin_delete on public.memberships
  for delete using (private.is_board(community_id));
create policy units_write on public.units
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));

-- ── 12. Invites: shareable claim codes + expiry ───────────────────────────
alter table public.invites
  add column code text not null default encode(gen_random_bytes(8), 'hex'),
  add column expires_at timestamptz not null default now() + interval '14 days';
create unique index invites_code_idx on public.invites (code);

-- Claim by code: same conversion as claim_invite(), but keyed on the invite
-- code so a copied link works no matter which email the neighbor signs up
-- with. SECURITY DEFINER — the function's own checks are the gate.
create or replace function public.claim_invite_code(invite_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile uuid;
  v_inv     public.invites%rowtype;
  v_unit    uuid;
begin
  select id into v_profile from public.profiles where user_id = auth.uid();
  if v_profile is null then return false; end if;
  if exists (select 1 from public.memberships where profile_id = v_profile and status = 'active') then
    return false;
  end if;
  select * into v_inv from public.invites
    where code = invite_code and status = 'pending' and expires_at > now()
    limit 1;
  if not found then return false; end if;
  if v_inv.unit_label <> '' then
    select id into v_unit from public.units
      where community_id = v_inv.community_id and label = v_inv.unit_label;
    if v_unit is null then
      insert into public.units (community_id, label)
        values (v_inv.community_id, v_inv.unit_label) returning id into v_unit;
    end if;
  end if;
  insert into public.memberships (profile_id, community_id, unit_id, role, status)
    values (v_profile, v_inv.community_id, v_unit, v_inv.role, 'active');
  update public.invites set status = 'accepted', accepted_at = now() where id = v_inv.id;
  return true;
end;
$$;
revoke execute on function public.claim_invite_code(text) from public, anon;
grant execute on function public.claim_invite_code(text) to authenticated;

-- Email claims also respect expiry now.
create or replace function public.claim_invite()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile uuid;
  v_email   text;
  v_inv     public.invites%rowtype;
  v_unit    uuid;
begin
  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));
  select id into v_profile from public.profiles where user_id = auth.uid();
  if v_profile is null or v_email = '' then return false; end if;
  if exists (select 1 from public.memberships where profile_id = v_profile and status = 'active') then
    return false;
  end if;
  select * into v_inv from public.invites
    where lower(email) = v_email and status = 'pending' and expires_at > now()
    order by created_at limit 1;
  if not found then return false; end if;
  if v_inv.unit_label <> '' then
    select id into v_unit from public.units
      where community_id = v_inv.community_id and label = v_inv.unit_label;
    if v_unit is null then
      insert into public.units (community_id, label)
        values (v_inv.community_id, v_inv.unit_label) returning id into v_unit;
    end if;
  end if;
  insert into public.memberships (profile_id, community_id, unit_id, role, status)
    values (v_profile, v_inv.community_id, v_unit, v_inv.role, 'active');
  update public.invites set status = 'accepted', accepted_at = now() where id = v_inv.id;
  return true;
end;
$$;

-- ── 13. Groups: lifecycle (archive, ownership, live member counts) ────────
alter table public.groups
  add column archived boolean not null default false,
  add column created_by uuid references public.profiles(id) on delete set null;
create policy groups_update on public.groups
  for update using (private.is_board(community_id) or created_by = private.current_profile_id())
  with check (private.is_board(community_id) or created_by = private.current_profile_id());

create or replace function private.sync_group_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.groups g
  set member_count = (select count(*) from public.group_members where group_id = coalesce(new.group_id, old.group_id))
  where g.id = coalesce(new.group_id, old.group_id);
  return coalesce(new, old);
end;
$$;
revoke execute on function private.sync_group_count() from public, anon, authenticated;
create trigger group_members_count
  after insert or delete on public.group_members
  for each row execute function private.sync_group_count();

-- ── 14. Messaging depth: photos, delete-own, board topic metadata, reads ──
alter table public.dm_messages    add column photos text[] not null default '{}';
alter table public.board_messages add column photos text[] not null default '{}';
alter table public.group_messages add column photos text[] not null default '{}';

create policy dm_messages_delete_own on public.dm_messages
  for delete using (sender_profile_id = private.current_profile_id());
create policy board_messages_delete_own on public.board_messages
  for delete using (sender_profile_id = private.current_profile_id());
create policy board_messages_update on public.board_messages
  for update using (private.is_board(community_id)) with check (private.is_board(community_id));

create table public.dm_reads (
  id           uuid primary key default gen_random_uuid(),
  thread_id    uuid not null references public.dm_threads(id) on delete cascade,
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  unique (thread_id, profile_id)
);
alter table public.dm_reads enable row level security;
create policy dm_reads_all on public.dm_reads
  for all using (profile_id = private.current_profile_id())
  with check (profile_id = private.current_profile_id()
    and exists (select 1 from public.dm_threads t where t.id = thread_id
      and private.current_profile_id() in (t.a_profile_id, t.b_profile_id)));

create table public.board_topics (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  name         text not null,
  archived     boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (community_id, name)
);
alter table public.board_topics enable row level security;
create policy board_topics_all on public.board_topics
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));

-- ── 15. Meetings ──────────────────────────────────────────────────────────
create table public.meetings (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  title        text not null,
  when_label   text not null default '',
  where_label  text not null default '',
  agenda       jsonb not null default '[]'::jsonb,
  minutes_path text,
  status       text not null default 'scheduled',  -- scheduled | past
  created_at   timestamptz not null default now()
);
create index meetings_community_idx on public.meetings (community_id, created_at desc);
alter table public.meetings enable row level security;
create policy meetings_read on public.meetings
  for select using (private.is_member(community_id));
create policy meetings_write on public.meetings
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));

-- ── 16. Audit log of board actions ────────────────────────────────────────
create table public.audit_log (
  id               uuid primary key default gen_random_uuid(),
  community_id     uuid not null references public.communities(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action           text not null,
  detail           text not null default '',
  created_at       timestamptz not null default now()
);
create index audit_log_community_idx on public.audit_log (community_id, created_at desc);
alter table public.audit_log enable row level security;
create policy audit_log_read on public.audit_log
  for select using (private.is_board(community_id));
create policy audit_log_insert on public.audit_log
  for insert with check (actor_profile_id = private.current_profile_id() and private.is_member(community_id));
