-- Phase 2 — votes domain. One open ballot per community drives the Today vote
-- card, the Hoa open-vote panel, and the board's quorum readout. A member casts
-- one ballot; the board maintains the authoritative tally + quorum counts.

create table public.votes (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  title        text not null,
  subtitle     text not null default '',
  closes_label text not null default '',
  quorum_total integer not null default 0,     -- households needed for quorum
  quorum_count integer not null default 0,     -- households counted so far
  yes_count    integer not null default 0,
  no_count     integer not null default 0,
  yes_label    text not null default 'Yes',
  no_label     text not null default 'No',
  receipt      text not null default '',       -- ballot receipt id shown to voter
  status       text not null default 'open',   -- open | closed
  created_at   timestamptz not null default now()
);
create index votes_community_idx on public.votes (community_id, status);

create table public.vote_ballots (
  id         uuid primary key default gen_random_uuid(),
  vote_id    uuid not null references public.votes(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  choice     text not null,                    -- yes | no
  created_at timestamptz not null default now(),
  unique (vote_id, profile_id)
);

alter table public.votes enable row level security;
alter table public.vote_ballots enable row level security;

create policy votes_read on public.votes
  for select using (private.is_member(community_id));
create policy votes_write on public.votes
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));

create policy vote_ballots_read on public.vote_ballots
  for select using (
    profile_id = private.current_profile_id()
    or exists (select 1 from public.votes v where v.id = vote_id and private.is_board(v.community_id))
  );
create policy vote_ballots_insert on public.vote_ballots
  for insert with check (
    profile_id = private.current_profile_id()
    and exists (select 1 from public.votes v where v.id = vote_id and private.is_member(v.community_id))
  );
