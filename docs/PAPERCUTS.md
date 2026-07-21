# Papercut backlog

Findings from the live-mode sweep (browser-driven as a real resident test
account, 2026-07-21). ✅ = fixed in that sweep; open items are ordered by
how much they'd embarrass us in front of a real community.

## Fixed

- ✅ Groups showed "Join" on groups you created/belong to — `group_members`
  query didn't select `profile_id`, so `joined` was always false (the
  "creator isn't added" bug: the row existed, the UI lied)
- ✅ Board desk entry visible to residents (gated on demo flag, not role)
- ✅ My Place demo cards in live: autopay bank row, Household, Vehicles & pets
- ✅ Today: hardcoded "Tuesday, July 1" date; hardcoded "A" avatar; fabricated
  ambient rows (pool cabana slots, "5 pins", the Okafors); booking/map rows
  were hidden whenever the community had no events
- ✅ Commons People: fabricated "3 unread" badge; visibility note said
  "Alex · #27" instead of the signed-in member; no directory empty state
- ✅ Commons Free stuff: no empty state
- ✅ Reserve: no amenities empty state; scripted visitor-pass card in live
- ✅ Documents: no empty state; "Your AI has read them all" while AI is stubbed
- ✅ MapScreen header hardcoded "Juniper Ridge"
- ✅ "1 members" pluralization in group lists
- ✅ Create group: no pending state while the insert ran

## Open — high

- ✅ ~~Write errors are silent~~ — error bus + toast; RLS zero-row updates
  detected; sheets skip success UI on failure
- ✅ ~~Report entry point only in Commons~~ — added to HOA Known issues card
  and Today's quiet list
- **Amenities have no live domain** — Reserve shows the empty state until an
  `amenities` table + board config tooling exists.
- **Messages/chat is demo-only** — live directory is empty and DMs have no
  tables; decide whether chat ships in v1 or hides in live.

## Open — medium

- Feed timestamps are stored labels ("Just now" forever); compute from
  `created_at` at read time.
- Every write triggers a full `refresh()` (~12 queries); hydrate only the
  touched domain.
- Issue/decision detail sheets are demo-keyed; live rows aren't tappable.
- Group archive semantics (matrix: creator/board archive, no hard delete) —
  no archive UI or policy yet.
- Directory opt-in isn't modeled (`profiles` needs a visibility flag before
  the live directory can populate).
- MyPlace settings rows (notifications prefs, language) are demo-local.

## Open — low

- Feed like/comment counts on demo posts are scripted; live generic cards
  have no reactions yet.
- Meeting screen is demo-gated but `meetingOpen` persists in localStorage;
  add a live guard for belt-and-braces.
- Onboarding flow is demo-only; live onboarding = magic link + invite (fine
  for now, revisit with invite tooling).
