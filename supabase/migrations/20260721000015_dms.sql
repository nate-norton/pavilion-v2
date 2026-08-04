-- Phase 2 — direct messages. Private 1:1 threads between community members.
-- Strictest RLS in the app: only the two participants can see a thread or its
-- messages — not the board, not neighbors (matrix: complaints-grade privacy).

create table public.dm_threads (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  a_profile_id uuid not null references public.profiles(id) on delete cascade,
  b_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  check (a_profile_id <> b_profile_id)
);
create unique index dm_threads_pair on public.dm_threads
  (community_id, least(a_profile_id, b_profile_id), greatest(a_profile_id, b_profile_id));

create table public.dm_messages (
  id                uuid primary key default gen_random_uuid(),
  thread_id         uuid not null references public.dm_threads(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body              text not null,
  created_at        timestamptz not null default now()
);
create index dm_messages_thread_idx on public.dm_messages (thread_id, created_at);

alter table public.dm_threads  enable row level security;
alter table public.dm_messages enable row level security;

create policy dm_threads_read on public.dm_threads
  for select using (
    private.current_profile_id() in (a_profile_id, b_profile_id)
  );
create policy dm_threads_insert on public.dm_threads
  for insert with check (
    private.is_member(community_id)
    and private.current_profile_id() in (a_profile_id, b_profile_id)
  );

create policy dm_messages_read on public.dm_messages
  for select using (
    exists (select 1 from public.dm_threads t where t.id = thread_id
            and private.current_profile_id() in (t.a_profile_id, t.b_profile_id))
  );
create policy dm_messages_insert on public.dm_messages
  for insert with check (
    sender_profile_id = private.current_profile_id()
    and exists (select 1 from public.dm_threads t where t.id = thread_id
                and private.current_profile_id() in (t.a_profile_id, t.b_profile_id))
  );
