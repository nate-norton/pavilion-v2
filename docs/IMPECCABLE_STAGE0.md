# Impeccable Stage 0: baseline findings

Date: 2026-09-02. Method: `/impeccable critique` on five surfaces, each as
two isolated sub-agents (design review, then detector and browser
evidence), plus `/impeccable audit src`. Snapshots live in
`.impeccable/critique/` (gitignored, per machine). Screenshots were taken
in demo mode at 393x830.

## Scores

| Surface | Critique | P0 | P1 | One-line verdict |
|---|---|---|---|---|
| Board Desk | 22/40 | 2 | 2 | Authored voice, generic shell; hero card buried last |
| Meeting | 20/40 | 1 | 2 | Live board tool has no hierarchy or ceremony |
| Today | 25/40 | 1 | 2 | Well-behaved template; the ask is not visually the ask |
| My Place | 21/40 | 1 | 3 | Settings list wearing a profile header |
| HOA | 24/40 | 2 | 2 | One authored moment (the vote card), then seven identical cards |
| Audit (whole tree) | 14/20 | 0 | 4 | Good; token discipline strong, primitives missing |

The static detector found 6 findings in the whole tree, none serious. The
flatness the owner sees breaks no rule, which is why a rule engine cannot
see it.

## Product defects found on the way (not design)

These were found by the reviewers and verified in source. They are
independent of any visual work and several breach the honesty rule.

1. **Ballot receipt is shared.** `votes.receipt` is generated once when the
   ballot opens; every household sees the same number
   (`SupabaseRepository.ts:1098`, `Hoa.tsx:592`).
2. **Minutes upload can attach to the wrong meeting.** One `minutesFileRef`
   is shared by every unpublished row (`BoardDesk.tsx:47`, `:717-727`).
3. **Live dues tile fabricates dates.** "Paid · Jul 1" and "Due Jul 3" are
   literals regardless of the statement (`MyPlace.tsx:95-99`).
4. **Events screen is ungated.** No `isDemo()` in `Events.tsx`; reachable
   from Today's "Calendar" button in any live community with one event.
   Renders Juniper Ridge's July calendar and fake RSVP counts.
5. **Special assessment sheet is ungated.** `SASheet.tsx` shows a literal
   $450, a fake bank, and a fake receipt for any live unit with an unpaid
   assessment; "Pay" writes nothing.
6. **Tapping a live ARC request opens nothing.** `ArcDetailSheet` resolves
   only demo ids.
7. **Irreversible board actions have no confirmation.** Close ballot,
   Resolve, Deactivate, Decline are one tap; the ARC panel closes before
   the promise resolves.
8. `text-sagedarkdark` is not a token; three success headlines render black
   (`BoardDesk.tsx:1346, :1657, :1763`).

## The flatness diagnosis, shared by all five surfaces

- **Elevation:** no shadows. Every card is paper with a 1px 8% navy hairline
  on mist, about a 1.06:1 edge. The ink shadow token and the `StackedCard`
  shadow exist and are used once per screen at most.
- **Colour:** one saturated surface per screen (the skydeep hero), then
  white, mist, navy, slate. Colour lives in 18px pills. The eight
  `StackedCard` tints, the peach control on chrome, and the pale beds
  (`skywash`, `sunsetpale`, `mint`, `goldpale`) are unused on these screens.
- **Type:** one display size per screen, then everything in a 10 to 13.5px
  band at weights 700 to 900. The 17, 19, 22 and 28px tiers are unused.
  When every line is bold, nothing is.
- **Imagery:** zero images on any surface. `StackedCard` has an image slot
  with a navy scrim that nothing uses.
- **Motion:** a 0.985 scale on mount and a fade on two success rows.
  Nothing on schedule, publish, approve or pay.

Every fix proposed uses tokens and components already in the system.

## Recommended shape of the work

Stage 1 (foundations) should build four primitives and use them
everywhere: `Card` with two elevation tiers, `Eyebrow`, `Field` with a
real label, and a shared status-to-tone map behind `Pill`. That alone
retires 96 inline borders, 87 hand-rolled eyebrows and 58 unlabeled
fields, and makes every later depth change a one-line edit.

Stage 2 (board) then does Board Desk's "needs you" hero with the vote
monitor tucked under it, CTA colour semantics (skydeep commit, sage
approve, red-text outline decline), confirmations and receipts on the four
irreversible actions, and the meetings card as a real panel with date
tiles.

The eight product defects above should be fixed first, on their own
branch, before any visual work: they are small, they are in live, and
several of them would be embarrassing in a pilot.

## Questions carried to Check-in 1

1. Fix the eight defects first on a separate branch, or fold them into the
   stages that touch those files?
2. On Board Desk, does the "needs you" hero replace the three KPI tiles or
   sit above them?
3. Scope per surface: all priority issues, or P0 and P1 only?
