-- Phase 2 — demo seed.
-- Deliberately minimal: only the "Juniper Ridge" community exists, so live mode
-- renders empty states everywhere else. Units, profiles, memberships, and domain
-- content get seeded once auth + the SupabaseRepository are wired in.
-- Idempotent on the community slug.

insert into public.communities (slug, name, brand)
values ('juniper-ridge', 'Juniper Ridge', '{}'::jsonb)
on conflict (slug) do update set name = excluded.name;
