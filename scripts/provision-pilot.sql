-- Provision a pilot community on the live Supabase project.
--
-- How to run: paste into the Supabase SQL editor (pavilion-dev) after editing
-- the EDIT ME values below. Idempotent — safe to re-run after adding rows.
--
-- What this does:
--   1. Creates the community.
--   2. Creates pending invites (board first). When an invited email signs in,
--      claim_invite() creates their unit + membership automatically — no
--      further SQL. Residents can also join via a board-shared ?invite= link.
--   3. Seeds the amenity list shown on the Reserve tab.
--
-- What this deliberately does NOT do:
--   - dues_statements: leave empty until a real payment path ships (M5b).
--     The client hides pay actions in live, but statements would still render.
--   - documents: upload through the app as a board member (Documents tab).
--
-- One-time dashboard step (not scriptable here): Auth → Passwords →
-- enable leaked password protection.

-- ── 1. Community ──────────────────────────────────────────── EDIT ME ──
insert into public.communities (slug, name)
values ('pilot-hoa', 'Pilot HOA')
on conflict (slug) do nothing;

-- ── 2. Invites (units are created when each invite is claimed) ─ EDIT ME ──
insert into public.invites (community_id, email, unit_label, role)
select c.id, i.email, i.unit_label, i.role::public.member_role
from public.communities c,
     (values
        -- board members first, so someone can invite the rest from the app
        ('board.president@example.com', '#1 Example Way',  'board'),
        ('board.treasurer@example.com', '#2 Example Way',  'board'),
        ('resident.one@example.com',    '#3 Example Way',  'resident')
     ) as i(email, unit_label, role)
where c.slug = 'pilot-hoa'
on conflict (community_id, lower(email)) where status = 'pending' do nothing;

-- ── 3. Amenities ──────────────────────────────────────────── EDIT ME ──
insert into public.amenities (community_id, name, sub, icon, rules, avail_label, sort_order)
select c.id, a.name, a.sub, a.icon, a.rules, a.avail_label, a.sort_order
from public.communities c,
     (values
        ('Clubhouse',  'Up to 40 · events & parties', 'ph-fill ph-buildings',
         'Reserve for private events; leave it how you found it.', 'Available today', 0),
        ('Pool',       'Guests welcome · 2-hr blocks', 'ph-fill ph-swimming-pool',
         'No glass on the deck.', 'Available today', 1)
     ) as a(name, sub, icon, rules, avail_label, sort_order)
where c.slug = 'pilot-hoa'
  and not exists (
    select 1 from public.amenities x where x.community_id = c.id and x.name = a.name
  );

-- Sanity check: what the pilot community looks like now.
select c.slug,
       (select count(*) from public.invites   i where i.community_id = c.id and i.status = 'pending') as pending_invites,
       (select count(*) from public.memberships m where m.community_id = c.id and m.status = 'active') as active_members,
       (select count(*) from public.amenities a where a.community_id = c.id) as amenities
from public.communities c
where c.slug = 'pilot-hoa';
