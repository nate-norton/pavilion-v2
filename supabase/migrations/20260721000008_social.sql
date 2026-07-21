-- Phase 2 — ambient/social domain: community events (Today's featured event,
-- the calendar, the Commons event card) and the Commons feed posts. Both are
-- community-scoped: members read them and post to the feed; the board manages
-- events. Empty for a fresh community, so a new member lands on empty states.

create table public.events (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  title        text not null,
  when_label   text not null default '',
  where_label  text not null default '',
  going        integer not null default 0,
  photo_label  text not null default '',
  tag_label    text not null default '',
  featured     boolean not null default false,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);
create index events_community_idx on public.events (community_id, sort_order);

create table public.feed_posts (
  id             uuid primary key default gen_random_uuid(),
  community_id   uuid not null references public.communities(id) on delete cascade,
  author_name    text not null,
  author_initial text not null default '',
  author_color   text not null default '#1A3352',
  unit_label     text not null default '',
  time_label     text not null default '',
  kind           text not null default 'post',   -- shoutout | borrow | event | post
  tag_label      text not null default '',
  body           text not null default '',
  photo_label    text not null default '',
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);
create index feed_posts_community_idx on public.feed_posts (community_id, sort_order);

alter table public.events enable row level security;
alter table public.feed_posts enable row level security;

create policy events_read on public.events
  for select using (private.is_member(community_id));
create policy events_write on public.events
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));

create policy feed_posts_read on public.feed_posts
  for select using (private.is_member(community_id));
create policy feed_posts_write on public.feed_posts
  for all using (private.is_member(community_id)) with check (private.is_member(community_id));
