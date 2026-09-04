# Impeccable pass: closeout

**Start here for design work.** This is the record of the `/impeccable` pass
run 2026-09-02 to 2026-09-04 across every surface of the app.

- `docs/IMPECCABLE_STAGE0.md` — the baseline this was measured against.
- `docs/IMPECCABLE_PLAN.md` — the staged plan and the five check-in decisions.
- `DESIGN.md` — rewritten from the shipped code at the end of the pass; the
  rules below are stated there normatively and summarised in `CLAUDE.md`.
- `.impeccable/critique/` — per-run snapshots. **Gitignored and per-machine**,
  so they do not survive a fresh checkout; everything that matters from them
  is in this file and in the baseline.

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


## How this was run, and how to repeat it

The method matters more than the numbers, because the numbers only mean
something against the same method.

Each surface was critiqued with `/impeccable critique <file>`, which the
skill requires to run as **two isolated sub-agents**: Assessment A is a
design review working only from source, and Assessment B is the deterministic
detector plus browser evidence. They must not see each other's output — the
detector's findings are deterministic and will anchor the subjective scoring
if they arrive first. A run where both happen in one context is a degraded
run and has to say so in a banner. `CLAUDE.md`'s "Agent delegation" section is
the standing grant that allows those sub-agents to be spawned without asking.

The whole-tree pass was `/impeccable audit src`, which is code-level and
independent of the critiques.

To re-measure after more work, run the same two commands on the same five
targets — `BoardDesk`, `Meeting`, `Today`, `MyPlace`, `Hoa` — and compare
against the table above. `/impeccable polish` reads the persisted snapshots
in `.impeccable/critique/` as its backlog, so a fresh container should
re-critique before polishing rather than polishing against nothing.

Two things worth knowing before trusting a re-run:

- **The static detector cannot see this class of problem.** At the baseline
  it found six findings across the whole tree while the app was at its
  flattest. Flatness broke no rule. The in-page detector (injected into a
  running dev server) was the useful deterministic signal, and it went from
  11 findings on Board Desk, 15 on My Place, 17 on HOA and 6 on Today to zero
  on the first three of those surfaces.
- **Sub-agents reported one failure honestly and one carelessly.** Reports
  from parallel agents sharing a checkout attributed each other's in-flight
  edits as test failures. Verify a surprising claim against the source before
  acting on it; several claims in this pass were checked that way and two
  turned out to be misreadings of a shared working tree.

## What this pass did not touch

- The `Repository` seam's contract, the Supabase schema beyond the one
  migration named above, and every write path's behaviour.
- Copy that states a fact. Instructional copy was rewritten in the brand
  voice; claims, amounts, dates and names were not.
- The demo's scripted beats, other than gating three of them (`Events`,
  `SASheet`, the board's nudge) so they stop rendering in live.
