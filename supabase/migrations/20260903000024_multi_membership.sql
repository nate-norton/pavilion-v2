-- A person can belong to more than one community.
--
-- Both claim functions used to refuse anyone who already held an active
-- membership anywhere, which meant a founder who had tested Pavilion once, or
-- a board member who also owns in a second HOA, silently dead-ended at the
-- no-community screen with a valid invite in hand. The (profile, community)
-- unique index still prevents joining the same community twice; a claim for a
-- community the person is already in just marks the invite accepted.

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
  select * into v_inv from public.invites
    where code = invite_code and status = 'pending' and expires_at > now()
    limit 1;
  if not found then return false; end if;
  if exists (select 1 from public.memberships
             where profile_id = v_profile and community_id = v_inv.community_id and status = 'active') then
    update public.invites set status = 'accepted', accepted_at = now() where id = v_inv.id;
    return true;
  end if;
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
  -- Oldest pending invite for a community this person is not yet in.
  select i.* into v_inv from public.invites i
    where lower(i.email) = v_email and i.status = 'pending' and i.expires_at > now()
      and not exists (select 1 from public.memberships m
                      where m.profile_id = v_profile and m.community_id = i.community_id and m.status = 'active')
    order by i.created_at limit 1;
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
