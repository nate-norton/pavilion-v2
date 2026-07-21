-- Phase 2 — groups domain (first real slice): groups + chat, members, polls,
-- events, pins, mutes. All community-scoped; RLS via the private helpers.

create table public.groups (
  id            uuid primary key default gen_random_uuid(),
  community_id  uuid not null references public.communities(id) on delete cascade,
  name          text not null,
  icon          text not null default 'ph-fill ph-users-three',
  color         text not null default '#1A3352',
  description   text not null default '',
  is_group_chat boolean not null default false,
  member_count  integer not null default 0,
  created_at    timestamptz not null default now()
);
create index groups_community_idx on public.groups (community_id);

create table public.group_members (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, profile_id)
);
create index group_members_group_idx on public.group_members (group_id);

create table public.group_messages (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index group_messages_group_idx on public.group_messages (group_id, created_at);

create table public.group_polls (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  question   text not null,
  options    jsonb not null default '[]'::jsonb,
  author     text not null default '',
  created_at timestamptz not null default now()
);
create index group_polls_group_idx on public.group_polls (group_id);

create table public.group_poll_votes (
  id         uuid primary key default gen_random_uuid(),
  poll_id    uuid not null references public.group_polls(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  option     text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, profile_id)
);

create table public.group_events (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  title       text not null,
  when_label  text not null default '',
  where_label text not null default '',
  going       integer not null default 0,
  created_at  timestamptz not null default now()
);
create index group_events_group_idx on public.group_events (group_id);

create table public.group_event_rsvps (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.group_events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create table public.group_pins (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  body       text not null,
  author     text not null default '',
  created_at timestamptz not null default now()
);
create index group_pins_group_idx on public.group_pins (group_id);

create table public.group_mutes (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references public.groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (group_id, profile_id)
);

-- Helper: is the current user a member of the group's community?
create or replace function private.can_see_group(g uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.groups gr
    where gr.id = g and private.is_member(gr.community_id)
  );
$$;

alter table public.groups            enable row level security;
alter table public.group_members     enable row level security;
alter table public.group_messages    enable row level security;
alter table public.group_polls       enable row level security;
alter table public.group_poll_votes  enable row level security;
alter table public.group_events      enable row level security;
alter table public.group_event_rsvps enable row level security;
alter table public.group_pins        enable row level security;
alter table public.group_mutes       enable row level security;

create policy groups_read   on public.groups for select using (private.is_member(community_id));
create policy groups_insert on public.groups for insert with check (private.is_member(community_id));

create policy gm_read   on public.group_members     for select using (private.can_see_group(group_id));
create policy gm_write  on public.group_members     for all    using (private.can_see_group(group_id) and profile_id = private.current_profile_id()) with check (private.can_see_group(group_id) and profile_id = private.current_profile_id());
create policy gmsg_read on public.group_messages    for select using (private.can_see_group(group_id));
create policy gmsg_ins  on public.group_messages    for insert with check (private.can_see_group(group_id) and profile_id = private.current_profile_id());
create policy gp_read   on public.group_polls       for select using (private.can_see_group(group_id));
create policy gp_ins    on public.group_polls       for insert with check (private.can_see_group(group_id));
create policy gpv_read  on public.group_poll_votes  for select using (exists (select 1 from public.group_polls p where p.id = poll_id and private.can_see_group(p.group_id)));
create policy gpv_write on public.group_poll_votes  for all    using (profile_id = private.current_profile_id()) with check (profile_id = private.current_profile_id() and exists (select 1 from public.group_polls p where p.id = poll_id and private.can_see_group(p.group_id)));
create policy ge_read   on public.group_events      for select using (private.can_see_group(group_id));
create policy ge_ins    on public.group_events      for insert with check (private.can_see_group(group_id));
create policy ger_read  on public.group_event_rsvps for select using (exists (select 1 from public.group_events e where e.id = event_id and private.can_see_group(e.group_id)));
create policy ger_write on public.group_event_rsvps for all    using (profile_id = private.current_profile_id()) with check (profile_id = private.current_profile_id() and exists (select 1 from public.group_events e where e.id = event_id and private.can_see_group(e.group_id)));
create policy gpin_read on public.group_pins        for select using (private.can_see_group(group_id));
create policy gmute_all on public.group_mutes       for all    using (profile_id = private.current_profile_id()) with check (profile_id = private.current_profile_id() and private.can_see_group(group_id));
