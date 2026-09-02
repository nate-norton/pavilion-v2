# Impeccable pass over Pavilion

A staged plan for running the `/impeccable` skill across the whole app. Five
stages, five check-ins. Each stage lands on its own branch cut from `dev` and
merges at its check-in, so `dev` (production) only moves when a stage is
signed off.

Two priorities shape the order and the commands:

1. **Board members first.** Board Desk, Meeting, Reserve, Portfolio, Documents
   and the board sheets are the most important surfaces in the app. They
   are critiqued first, refined first, and walked first at every check-in.
2. **Less flat, less plain.** The current app reads as flat and boring. Each
   refinement stage therefore includes `/impeccable bolder`, `/impeccable
   colorize` and `/impeccable delight`, pointed at depth, warmth and
   personality inside the existing brand, not at a new look.

Standing rules for every stage:

- `npx vitest run` and `npm run build` green before every commit.
- Refinement, not redesign: the sky/sunset/navy system in `DESIGN.md` stays.
  The skill treats the incumbent look as the brief.
- The text-bearing accent rule and the `.bg-ai` navy-foreground rule are
  hard constraints; the token test in `src/theme/tokens.test.ts` guards them.
- Nothing fabricated may render in live. Every empty state the pass touches
  must still be honest for a fresh community.
- The rehearsed demo at demo.pavilion.community is not redeployed until the
  final check-in. Code on `dev` does not reach it automatically.

## Decisions from Check-in 1 (2026-09-02)

- The eight live defects in `docs/IMPECCABLE_STAGE0.md` fold into the
  stage that owns each file rather than a separate branch.
- On Board Desk the "needs you" hero replaces the three KPI tiles.
- Every stage takes on all priority issues, P0 through P2.
- Stage 0 was docs only and is not merged to `dev` alone; Stage 1 stacks
  on it and both merge at Check-in 2.

## Decisions from Check-ins 2 and 3 (2026-09-02)

- Stage 1 primitives approved as shown in the design-system gallery.
- Stage 2 board pass approved. Stages 0 to 2 merged to `dev` together.
- Stage 3 cuts from `dev` as `impeccable/3-resident`.
- Check-in 4: resident pass approved, all eight Stage 0 defects closed,
  ballot receipt migration applied to `pavilion-dev`. Stage 3 merged to
  `dev`; Stage 4 cuts as `impeccable/4-closeout`.

## Stage 0: Baseline (evidence only, no edits)

Commands: `/impeccable critique` on Board Desk and Meeting first, then on
Today, My Place and HOA; `/impeccable audit src` for the whole tree
(accessibility, performance, responsive).

Output: scored critique snapshots per surface, an audit findings list, and a
proposed priority order. Nothing changes in the code.

**Check-in 1:** review the findings together. Decide the priority order,
which findings to ignore (recorded in `.impeccable/critique/ignore.md`), and
whether any surface deserves more than refinement.

## Stage 1: Foundations (shared components and tokens)

Targets: `NavDock`, `Sheet`, `Pill`, `Chip`, `StackedCard`, `EmptyState`,
`ProgressBar`, `SegmentedControl`, `Toggle`, `Hint`, `AppToast`, and the
`:root` token block in `src/index.css`.

Commands: `/impeccable bolder` and `/impeccable colorize` on the component
set and tokens to give cards, chrome and controls depth and warmth, then
`/impeccable layout`, `/impeccable typeset` and `/impeccable polish`. Fixes here propagate to every screen, so this
stage happens before any screen work.

**Check-in 2:** screenshots of before and after on Today and My Place, which
exercise most shared components. Confirm the rhythm and type scale before
rolling it out.

## Stage 2: Board and onboarding

Targets: `SignIn`, `Onboarding`, `BoardSetupCard`, `SetupGuideSheet`,
`RosterInvite`, `BoardDesk`, `BoardChat`, `Meeting`, `Reserve`, `Portfolio`,
`Documents`, `MapScreen`, `IssueDetailSheet`, `ReportSheet`,
`ManageAmenitiesSheet`, `ExportSheet`, `PassSheet`, `SASheet`,
`CreateGroupSheet`, `ComposeSheet`.

Commands: `/impeccable onboard` on the sign-in and first-run flow,
`/impeccable polish` and `/impeccable harden` on the board surfaces,
`/impeccable clarify` on board copy, which is the densest in the app, and
`/impeccable delight` on the moments a volunteer should feel good about:
approving a request, closing a vote, publishing minutes.

**Check-in 3:** walk the founder path from invite to first board action, and
the board path through approve, answer, open a vote, publish minutes.

## Stage 3: Resident loop

Targets, in order: `Today`, `MyPlace` with `PaySheet` and
`PaymentDetailSheet`, `Hoa` with `ArcSheet`, `ArcDetailSheet`,
`DecisionDetailSheet`, `ViolSheet`, `Commons`, `Events`, `Messages`, `Chat`,
`GroupDetail`, `CircleDetail`, `Notifications`, `Search`.

Commands per surface: `/impeccable polish`, `/impeccable clarify` for labels
and error copy, `/impeccable harden` for loading, error, and empty states in
live mode.

**Check-in 4:** walk the resident loop in the browser on the phone frame:
pay dues, check a vote, RSVP, read the feed. Sign off or redirect.

## Stage 4: Verification and closeout

Commands: re-run `/impeccable audit src` and `/impeccable critique` on the
same surfaces as Stage 0 to compare scores. `/impeccable adapt` for the
in-browser desktop view around the phone frame. `/impeccable document` to
refresh `DESIGN.md` from the shipped code, followed by `/impeccable doctor`.
Optional if the budget allows: `/impeccable animate` on sheet transitions and
`/impeccable delight` on the confetti and AI orb moments.

**Check-in 5:** score deltas from Stage 0, the refreshed `DESIGN.md`, and
the decision on whether to re-release the demo from the new `dev`.

## Sequence

| Stage | Branch | Ends with |
|---|---|---|
| 0 Baseline | `impeccable/0-baseline` | Check-in 1: priorities |
| 1 Foundations | `impeccable/1-foundations` | Check-in 2: component sign-off |
| 2 Board and onboarding | `impeccable/2-board` | Check-in 3: board walkthrough |
| 3 Resident loop | `impeccable/3-resident` | Check-in 4: resident walkthrough |
| 4 Closeout | `impeccable/4-closeout` | Check-in 5: deltas and demo release |
