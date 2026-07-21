-- Phase 2 — Auth: auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, name, initial)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    upper(left(coalesce(nullif(new.raw_user_meta_data->>'name', ''), new.email), 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- Only the trigger (postgres) invokes it; nobody should call it via the API.
revoke execute on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
