-- Stage 0 — founding a community ("seat zero").
--
-- Every other way into Pavilion is an invite: the board invites a neighbor,
-- the neighbor claims it, claim_invite() converts it to a membership. That
-- chain works in both directions except at the very start, where nobody is
-- board yet and so nobody can invite anyone. Founding is the one action that
-- has to come from outside the tenant, and until now it was hand-run SQL.
--
-- found_community() is that action, made repeatable: create (or find) the
-- community, seed its units, and put a pending board invite in front of every
-- founding board member at once. From the board's first sign-in onward the
-- normal invite chain takes over and this function is never needed again.
--
-- Deliberately NOT reachable from the app. It is granted to service_role
-- only, so it cannot be called with an end-user JWT through PostgREST, and it
-- runs SECURITY INVOKER — unlike claim_invite(), the caller here already has
-- full rights, so there is nothing for a DEFINER to elevate and no new
-- security-advisor surface.

create or replace function public.found_community(
  p_slug         text,
  p_name         text,
  p_board_emails text[],
  p_unit_labels  text[] default '{}',
  p_app_url      text   default 'https://app.pavilion.community'
)
returns table (email text, status text, invite_url text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_community uuid;
  v_email     text;
  v_code      text;
begin
  if coalesce(trim(p_slug), '') = '' or coalesce(trim(p_name), '') = '' then
    raise exception 'found_community: slug and name are both required';
  end if;

  -- Re-runnable: founding the same slug twice tops up whatever is missing
  -- rather than erroring out or creating a second community.
  select id into v_community from public.communities where slug = p_slug;
  if v_community is null then
    insert into public.communities (slug, name)
      values (p_slug, trim(p_name))
      returning id into v_community;
  end if;

  -- Seed the roster's homes. Board invites carry no unit_label (a board seat
  -- is not a household), so these exist for the resident invites that follow.
  insert into public.units (community_id, label)
    select v_community, trim(u)
    from unnest(coalesce(p_unit_labels, '{}')) as u
    where trim(u) <> ''
  on conflict (community_id, label) do nothing;

  foreach v_email in array coalesce(p_board_emails, '{}') loop
    v_email := lower(trim(v_email));
    continue when v_email = '';

    -- claim_invite() refuses anyone who already holds an active membership,
    -- so an invite for such an address would sit pending forever. Say so here
    -- instead of leaving a dead row to debug later.
    if exists (
      select 1 from public.memberships m
      join public.profiles p on p.id = m.profile_id
      join auth.users u on u.id = p.user_id
      where lower(u.email) = v_email and m.status = 'active'
    ) then
      email := v_email; status := 'already_member'; invite_url := null;
      return next; continue;
    end if;

    -- The partial unique index allows one pending invite per email per
    -- community; reuse that row's code so a re-run hands back the same link.
    select i.code into v_code from public.invites i
      where i.community_id = v_community
        and lower(i.email) = v_email
        and i.status = 'pending';

    if v_code is null then
      insert into public.invites (community_id, email, unit_label, role, status)
        values (v_community, v_email, '', 'board', 'pending')
        returning code into v_code;
      email := v_email; status := 'invited';
    else
      -- Push a stale founding invite back out so a slow board still lands.
      update public.invites set expires_at = now() + interval '14 days'
        where code = v_code and expires_at < now() + interval '2 days';
      email := v_email; status := 'already_invited';
    end if;

    invite_url := rtrim(p_app_url, '/') || '/?invite=' || v_code;
    return next;
  end loop;
end;
$$;

-- Founding creates a tenant. No end-user JWT may reach it.
revoke execute on function
  public.found_community(text, text, text[], text[], text) from public, anon, authenticated;
grant execute on function
  public.found_community(text, text, text[], text[], text) to service_role;
