# Feature Enrichment Ledger

Distinct from `PAPERCUTS.md` (friction in what exists), this tracks **depth
gaps**: features built breadth-first to their minimum viable shape (a
*walking skeleton*). The deepening pass ran overnight 2026-07-22 —
statuses below. Payments (#9) and notifications (#10) were parked by Nate
for morning review.

## ✅ Deepened (live in the app)

- **Polls v2** — yes/no or N options (up to 6), optional multi-select,
  real deadlines (3d/1w/2w/none), multiple concurrent ballots, change
  your vote while open, board Close action that logs into Decisions,
  Past-votes archive on the HOA tab.
- **Board chat** — full-screen conversation (was a cramped sheet):
  topic list with pinned General, auto-scroll, photo attachments,
  delete-own-message, topic rename + archive.
- **Reports** — urgency + location + real photo upload; board triage
  expands into photos, vendor assignment, in-progress status, private
  board notes, and a two-way thread with the reporter (reporter replies
  from MyPlace → My requests).
- **ARC** — file attachments (photos/plans/PDFs); board decisions are
  Approve-with-conditions / Decline-with-reason / Needs-info; the
  resident sees notes/conditions inline and can resubmit.
- **Violations** — board issues courtesy/warning/fine notices per unit
  with description + evidence photos; resident sheet is severity-aware;
  board resolves; self-cure kept.
- **Documents** — real library: board uploads (PDF/Office/images) with
  sections, signed-URL open, delete. Minutes publishing files here too.
- **Meetings** — board schedules (title/when/where/agenda), publishes
  minutes; residents see meetings + minutes on the HOA tab.
- **Feed** — categories (Shoutout / Help & Borrow / For Sale & Free),
  photos, hearts, comment threads, delete-own (board any), board
  pin-to-top. Fixed an RLS hole (any member could edit any post).
- **Events** — board creates community events; one-tap RSVP with
  trigger-maintained counts on Today's featured card.
- **Reservations** — per-amenity booking config (open/close hours, slot
  length, book-ahead window) drives a generated live grid with real
  dates; board sees all community bookings.
- **Profiles & directory** — edit name/phone, hide-from-directory
  toggle (respected everywhere); server-side DM read marks (unread
  follows you across devices).
- **DMs** — real photo messages, delete-own-message.
- **Groups** — live polls and events inside groups, leave, archive
  (creator/board), live member counts via trigger.
- **Members & invites** — roster admin (role change, deactivate/
  reactivate, unit reassign with find-or-create), invite expiry (14d),
  renew, and copyable invite links (`?invite=CODE`) that claim for any
  email.
- **Audit trail** — every board action logs to a board-visible Recent
  activity card.
- **Search (live)** — indexes people, amenities, documents, events, and
  my requests.

## 🅿️ Parked for morning review (Nate)

- **#9 Payments** — dues render, "Pay" is still theater. Needs a
  processor decision (Stripe), receipts, autopay, statements. Board
  Money tab (ledger/aging/export) parked with it.
- **#10 Notifications** — no push/email; every flow still ends "…and
  nobody finds out until they open the app." Invite emails, digest,
  status-change pings all land here. Needs an email provider decision
  (Resend/Postmark via edge function) — schema and flows are ready for
  it.

## 🟡 Consciously deferred (small, post-review)

- Duplicate-report merging (board can resolve with a note instead).
- DM reactions + typing indicators (posts have hearts; DMs delete/photo
  only).
- Capacity >1 enforcement, recurring bookings, waitlists, blackout
  dates (capacity is stored, not yet enforced at booking time).
- Ballot discussion threads.
- ARC per-unit history view for the board (queue shows all, unfiltered).
- Map pins (needs real geo data), AI assistant (stub — needs an API key
  decision, effectively parked with #10), demo-style finance panels.
- Password reset: N/A — live auth is passwordless magic-link.
