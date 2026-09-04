# Impeccable pass: closeout

Date: 2026-09-02. Baseline in `docs/IMPECCABLE_STAGE0.md`; snapshots in
`.impeccable/critique/` (per machine, gitignored).

## Score deltas

Same method both times: `/impeccable critique` per surface with two
isolated sub-agents (design review, then detector and browser evidence),
plus `/impeccable audit src`.

| Surface | Before | After | Change |
|---|---|---|---|
| Board Desk | 22/40 | 25/40 | +3 |
| Meeting | 20/40 | 23/40 | +3 |
| Today | 25/40 | 25/40 | — (its P0 fixed) |
| My Place | 21/40 | 25/40 | +4 |
| HOA | 24/40 | 30/40 | +6 |
| Audit (whole tree) | 14/20 | 15/20 | +1 |

The in-page detector went from 11 findings on Board Desk, 15 on My Place,
17 on HOA and 6 on Today to **zero on Today, My Place and every Board Desk
tab except Money and Comms**, and three on HOA (10.5px ARC timeline
labels, since raised to 12px).

## What the flatness fix actually was

Not a repaint. The tokens, the type ramp and the components were already
in `:root` and `src/components/`; the screens simply never asked for them.
Four primitives now own the surfaces — `Card` with two elevations,
`SectionHeading`, `Field`, `Pill` with one status vocabulary — and the
rules they encode are recorded in `DESIGN.md`:

- **Elevation means something.** Flat reports, raised asks, one skydeep
  chrome hero per screen. The old system was flat-only: every card was
  paper behind an 8% hairline, a 1.06:1 edge.
- **Sections are headings, not eyebrows.** 87 hand-rolled 11px caps labels
  became 17px titles with the count on a meta line after them.
- **One CTA colour rule.** Skydeep commits, sagedark approves, red-text
  outline declines, peach is the warm control on chrome. Sunset backs no
  button; it measures 2.64:1 under white.
- **A 12px floor** for anything a person must read to act.

Audit counts at closeout: `Card` 106 uses against 5 remaining inline
hairlines; `SectionHeading` 81 against 7 hand-rolled eyebrows, 4 of them
in the presenter panel; `Field` 73 uses and every native control labelled.

## Defects closed

All eight from the baseline, plus four the re-critique found:

1. Ballot receipt was shared by every household — now minted per ballot by
   the database (`20260903000028_ballot_receipts.sql`, applied to
   `pavilion-dev`), with an honest "Ballot recorded · secret ballot" until
   a row has one.
2. Minutes could upload to the wrong meeting (one shared file input).
3. Live dues tile hardcoded "Paid · Jul 1" / "Due Jul 3".
4. `Events.tsx` rendered Juniper Ridge's scripted calendar in live.
5. `SASheet.tsx` showed a literal $450, a fake bank and a fake receipt in
   live, and "Pay" wrote nothing.
6. Tapping a live ARC request opened nothing.
7. Close ballot, resolve, deactivate and decline fired on one tap with no
   confirmation and no receipt.
8. `text-sagedarkdark` was not a token; three headlines rendered black.
9. Today could say "All caught up" above an open notice.
10. The HOA subtitle promised every dollar on a live screen with none.
11. The board's nudge control claimed "queued for tonight's digest — app,
    email & SMS" in live, where notifications do not exist.
12. A closed vote was labelled with the date it opened.

## What is still open

Ranked, with the command that owns each:

- **P1 `harden`** — the live My Place hero is a dead end: an amount and a
  status with no next step, no itemization, no how-to-pay. Payments are
  not implemented, but "not collected here" still needs a return address.
- **P1 `harden`** — publish-minutes is offered on meetings that have not
  happened and flips them to past; a scheduled meeting cannot be edited or
  cancelled. Both need `starts_at` as a real timestamp and two repository
  methods.
- **P1 `clarify`** — the board decides ARC requests from a ref, a title
  and a unit; `BoardArcItem` carries no description and attachments open
  in a new tab.
- **P1 `delight`** — the ballot receipt is inert text with nowhere to live.
- **P2 `distill`** — the live Desk tab stacks nine sections with the member
  admin console between triage and notices.
- **P2 `optimize`** — 22 selector-less store subscriptions and 11
  per-keystroke writes into a persisted store.
- **P2 `layout`** — a board member on Today meets four elevated surfaces
  before the first row.
- **P3** — `CircleDetail.tsx` is unreachable; `BoardDesk.tsx` is 2,100
  lines in one component.

## The demo

Untouched by this pass in the sense that matters: the demo project is
disconnected from Git and deploys by hand. `dev` now carries all four
stages, so releasing the demo is a deliberate `vercel --prod` from the
commit you want. Nothing here has been pushed to demo.pavilion.community.
