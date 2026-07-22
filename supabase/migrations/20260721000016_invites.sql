-- Phase 2 — invites. The board invites a neighbor by email; when that email
-- signs in, claim_invite() converts the pending invite into an active
-- membership (finding or creating the unit) — no hand-run SQL to join.
--
-- NOT YET APPLIED.

create table public.invites (
  id           uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  email        text not null,
  unit_label   text not null default '',
  role         public.member_role not null default 'resident',
  status       text not null default 'pending',   -- pending | accepted | revoked
  invited_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  accepted_at  timestamptz
);
create unique index invites_pending_email on public.invites (community_id, lower(email))
  where status = 'pending';

alter table public.invites enable row level security;

-- Board manages invites; the invited person can see their own (by JWT email).
create policy invites_board on public.invites
  for all using (private.is_board(community_id)) with check (private.is_board(community_id));
create policy invites_own_read on public.invites
  for select using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Atomically claim a pending invite for the signed-in user's email:
-- create the unit if needed, insert the membership, mark the invite accepted.
-- SECURITY DEFINER because the claimant has no membership yet and so cannot
-- pass any is_member/is_board policy; the function's own checks are the gate.
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
  -- already a member somewhere → nothing to claim
  if exists (select 1 from public.memberships where profile_id = v_profile and status = 'active') then
    return false;
  end if;
  select * into v_inv from public.invites
    where lower(email) = v_email and status = 'pending'
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

revoke execute on function public.claim_invite() from public, anon;
grant execute on function public.claim_invite() to authenticated;
