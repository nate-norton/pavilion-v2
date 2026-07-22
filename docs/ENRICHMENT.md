# Feature Enrichment Ledger

Distinct from `PAPERCUTS.md` (friction in what exists), this tracks **depth
gaps**: features built breadth-first to their minimum viable shape. Everything
here "technically works" but is the thinnest version of itself. The pattern is
called a *walking skeleton* / *happy-path implementation* — the deliberate
first pass of Phase 2. This ledger is the deepening pass.

Legend: 🔴 blocks real-world credibility · 🟠 real users will hit it fast ·
🟡 expected eventually. File refs point at the shallow implementation.

## Governance & voting

- 🔴 **Polls are binary only.** `openVote` takes question + 2 labels
  (`BoardDesk.tsx` vote draft, `NewVote` in `Repository.ts`, `votes` table).
  Real boards need: N options, multi-select, an end date, quorum target,
  anonymous vs recorded, attach a document, close/extend early, and more
  than one open ballot at a time.
- 🟠 **No ballot lifecycle.** Can't edit a draft, cancel a live vote, or see
  past results (closed votes vanish; only the decisions log remains).
- 🟡 No discussion thread on a ballot; voters can't change their vote.

## Board chat & messaging

- 🔴 **Board chat lives in a bottom sheet** (`BoardChatSheet.tsx`,
  maxHeight 88%, thread capped at 380px). A conversation needs a full-screen
  view like `Chat.tsx`, auto-scroll to newest, and unread tracking.
- 🟠 DMs and board chat are text-only: no photos, no reactions, no
  edit/delete, no typing indicator. Unread marks are per-device
  (`localStorage`), so a second device shows everything unread.
- 🟠 Topic management: no rename, archive, or delete; a typo'd topic lives
  forever.
- 🔴 **No notifications anywhere.** Nobody knows a message/vote/violation
  exists until they open the app (cross-cutting; also under Platform).

## Reports & maintenance (triage)

- 🔴 **Photo attach is fake.** `ReportSheet.tsx` toggles "photo added ✓"
  without uploading anything (no Supabase Storage wired at all).
- 🟠 Triage is open→resolved only (`setReportStatus`): no in-progress, no
  assignment (person or vendor), no board notes, no comment thread with the
  reporter, no duplicate merging.
- 🟡 No urgency/location fields on submission; reporter gets no status
  change signal.

## ARC requests

- 🔴 **Board can only Approve.** The queue button calls
  `decideArc(id, true)` (`BoardDesk.tsx:557`) — no deny with reason, no
  request-more-info loop, no conditions attached to approval.
- 🔴 No attachments — real ARC submissions are plans + photos + paint chips.
- 🟡 No appeal/resubmit flow; no ARC history per unit.

## Reservations & amenities

- 🟠 **Slots/days are hardcoded** (`SLOTS`/`DAYS` constants in
  `Reserve.tsx`): every amenity shares the same fixed 7-day, fixed-times
  grid. Amenities need per-amenity hours, slot length, and booking window.
- 🟠 `ManageAmenitiesSheet` is name/sub/rules/icon only — no hours,
  capacity, or per-amenity policy.
- 🟡 One-active-booking-per-household is the only policy; no recurring
  bookings, waitlist (demo has one, live doesn't), capacity >1, blackout
  dates, or a board calendar view of all bookings.

## Money

- 🔴 **No real payments.** Live dues render from the table, but "Pay" is
  theater — no processor (Stripe), no receipts, no autopay, no statement
  PDFs. Fine pre-pilot, fatal for a real HOA.
- 🟠 Board Money tab in live is mostly hidden: no ledger, no delinquency
  aging (demo-only), no assessment issuance flow, no export.

## Commons (feed, events, groups)

- 🟠 Posts are text-only (`ComposeSheet.tsx` image icon is decorative); no
  comments, reactions, categories (for-sale/free/lost+found), pinned board
  announcements, delete-own-post, or moderation/report tools in live.
- 🟠 Events are read-only in live: no board create-event UI, no RSVP write,
  no calendar export.
- 🟡 Live groups have chat only — the Polls/Events/Members tabs that make
  demo groups feel alive are demo-scripted; no join approval, leave, group
  archive (papercut ledger), or member management.

## People, units & membership

- 🔴 **Invites don't send email.** `createInvite` writes a row;
  the neighbor must be told out-of-band to sign up with that address. Needs
  a real email send + copy-link, resend, expiry, bulk import.
- 🟠 No profile editing: name, photo, phone, avatar color are set at claim
  time and frozen. No household members in live.
- 🟠 No member admin: change role, deactivate/remove, reassign unit,
  home-sale transfer.
- 🟡 Directory opt-in/privacy flag (also on papercut ledger).

## Compliance (violations)

- 🔴 **Board can't create a violation in live.** Only the demo's scripted
  notice exists; live is read + self-cure only (`SupabaseRepository.ts`
  violations block). No issue flow, escalation ladder, fine schedule, or
  photo evidence.

## Documents

- 🔴 **No live documents at all** — `listDocuments` returns `[]`
  (`SupabaseRepository.ts:598`). Boards need CC&R/bylaw/minutes upload
  (Supabase Storage) with sections and search.

## Meetings

- 🟡 Meeting prep/minutes/digest are demo-only. Live needs: schedule a
  meeting, agenda builder, publish minutes (ties into Documents).

## Platform & cross-cutting

- 🔴 **Notifications**: no push, no email digests — every domain above ends
  with "…and nobody finds out."
- 🟠 Search in live only covers what's hydrated; AI sheet is a stub
  (`AiSheet.tsx`); map pins are demo-only.
- 🟡 No password reset UI, no profile-setup step on first sign-in beyond
  invite claim, no audit log of board actions.

## Suggested deepening order

1. **Attachments infrastructure** (Supabase Storage): unlocks report photos,
   ARC plans, documents, post images in one move.
2. **Notifications** (email first): makes every existing write path land.
3. **Polls v2** (N options + deadline + close): most visible governance gap.
4. **Full-screen board chat + DM parity** (reuse `Chat.tsx` shell).
5. **ARC deny/info-requested + violations board flow**: completes the two
   compliance loops.
6. **Invite emails + member admin**: what onboarding a real community hits
   first.
