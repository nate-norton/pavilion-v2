-- found_community() reported `already_member` for anyone active in *any*
-- community, which matched the old one-community-per-account rule. Accounts
-- can now belong to several, so only an active membership in this community
-- means there's nothing to invite.
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

  select id into v_community from public.communities where slug = p_slug;
  if v_community is null then
    insert into public.communities (slug, name)
      values (p_slug, trim(p_name))
      returning id into v_community;
  end if;

  insert into public.units (community_id, label)
    select v_community, trim(u)
    from unnest(coalesce(p_unit_labels, '{}')) as u
    where trim(u) <> ''
  on conflict (community_id, label) do nothing;

  foreach v_email in array coalesce(p_board_emails, '{}') loop
    v_email := lower(trim(v_email));
    continue when v_email = '';

    if exists (
      select 1 from public.memberships m
      join public.profiles p on p.id = m.profile_id
      join auth.users u on u.id = p.user_id
      where lower(u.email) = v_email and m.community_id = v_community and m.status = 'active'
    ) then
      email := v_email; status := 'already_member'; invite_url := null;
      return next; continue;
    end if;

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
      update public.invites set expires_at = now() + interval '14 days'
        where code = v_code and expires_at < now() + interval '2 days';
      email := v_email; status := 'already_invited';
    end if;

    invite_url := rtrim(p_app_url, '/') || '/?invite=' || v_code;
    return next;
  end loop;
end;
$$;
