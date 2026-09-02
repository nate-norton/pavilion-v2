-- Read an invitation before sign-in, so the front door can say who invited
-- you, to what, and under which address — instead of "sign in with your
-- email and password" and hoping the person guesses the right one.
--
-- SECURITY DEFINER and callable by anon: the 64-bit code is the bearer secret
-- (14-day expiry). Returns one row for any known code so the UI can explain
-- an expired or already-used link; zero rows for an unknown one. Never
-- returns ids. This is the fourth expected advisor warning on pavilion-dev.
create or replace function public.peek_invite(invite_code text)
returns table (
  community_name text,
  inviter_name   text,
  role           text,
  unit_label     text,
  email          text,
  state          text   -- pending | expired | accepted | revoked
)
language sql
security definer
stable
set search_path = public
as $$
  select c.name,
         coalesce(p.name, ''),
         i.role::text,
         i.unit_label,
         i.email,
         case
           when i.status = 'pending' and i.expires_at <= now() then 'expired'
           else i.status
         end
  from public.invites i
  join public.communities c on c.id = i.community_id
  left join public.profiles p on p.id = i.invited_by
  where i.code = invite_code
  limit 1;
$$;

revoke execute on function public.peek_invite(text) from public;
grant execute on function public.peek_invite(text) to anon, authenticated;
