-- Phase 2 — board chat. A private channel for the community's board members,
-- inside the Board Desk. Residents can neither read nor write it (is_board
-- gates both); realtime delivery included.

create table public.board_messages (
  id                uuid primary key default gen_random_uuid(),
  community_id      uuid not null references public.communities(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body              text not null,
  created_at        timestamptz not null default now()
);
create index board_messages_community_idx on public.board_messages (community_id, created_at);

alter table public.board_messages enable row level security;

create policy board_messages_read on public.board_messages
  for select using (private.is_board(community_id));
create policy board_messages_insert on public.board_messages
  for insert with check (
    private.is_board(community_id)
    and sender_profile_id = private.current_profile_id()
  );

alter publication supabase_realtime add table public.board_messages;
