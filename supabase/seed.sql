-- Phase 2 — demo seed: the "Juniper Ridge" community, mirroring the mock demo
-- so live mode has something rich to show. Idempotent on the community slug;
-- intended to run against a fresh dev database.

with community as (
  insert into public.communities (slug, name, brand)
  values ('juniper-ridge', 'Juniper Ridge', '{}'::jsonb)
  on conflict (slug) do update set name = excluded.name
  returning id
),
seed_units as (
  insert into public.units (community_id, label)
  select c.id, v.label
  from community c, (values
    ('#27 Alder Way'),
    ('#42 Juniper Way'),
    ('#7 Cedar Lane'),
    ('#18 Birch Court'),
    ('#23 Willow Bend')
  ) as v(label)
  on conflict (community_id, label) do nothing
  returning id, label
),
seed_profiles as (
  insert into public.profiles (name, initial, color)
  select v.name, v.initial, v.color
  from (values
    ('Alex Rivera', 'A', '#1A3352'),
    ('Rosa M.',     'R', '#C75A31'),
    ('Tom B.',      'T', '#4A90E2'),
    ('Priya S.',    'P', '#2A9D5C'),
    ('The Okafors', 'O', '#D9A441')
  ) as v(name, initial, color)
  where not exists (select 1 from public.profiles p where p.name = v.name)
  returning id, name
)
insert into public.memberships (profile_id, community_id, unit_id, role)
select p.id, c.id, u.id, v.role::public.member_role
from community c
join (values
  ('Alex Rivera', '#27 Alder Way',  'board'),
  ('Rosa M.',     '#42 Juniper Way','resident'),
  ('Tom B.',      '#18 Birch Court','resident'),
  ('Priya S.',    '#7 Cedar Lane',  'resident'),
  ('The Okafors', '#23 Willow Bend','resident')
) as v(name, unit_label, role) on true
join public.profiles p on p.name = v.name
join public.units u on u.label = v.unit_label and u.community_id = c.id
on conflict (profile_id, community_id) do nothing;
