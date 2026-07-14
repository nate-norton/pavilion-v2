# Pavilion v2 — Expert Review

**Overall grade: A− as a demo prototype.** This is one of the more convincing HOA product visions I've seen — the positioning is genuinely differentiated, the craft is high, and the demo infrastructure (roles, scenario toggles, reset) shows real presenter empathy. The gap between this and an A+ is not more features; it's a handful of demo-day risks and a few missed storytelling moments.

## What's genuinely innovative (lean into these when presenting)

1. **The emotional inversion.** Every incumbent (AppFolio, Buildium, TownSq, FRONTSTEPS) feels like enforcement software. Pavilion feels like a neighborhood: "Courtesy notice · no fee · auto-closes if fixed," "past due · courtesy period, no fees yet," a violation flow that assumes good faith. That tone is the product. Name it explicitly in your pitch — "compliance without hostility" is a slide, not just a vibe.
2. **"The HOA, in the open."** The itemized $285 breakdown, reserve fund at 82% of study, "$18,400 from reserves · 3 bids reviewed" on the vote card — radical transparency as a first-class UI concept. This is the screen that will make board members sit up.
3. **Grounded, honest AI.** The assistant cites sections (CC&Rs §4.2), and — this is the best detail in the app — when it doesn't know, it says *"I couldn't find that in the documents, so I won't guess"* and offers to route to the board. An AI that refuses to hallucinate rules is exactly the right posture for a legal-document domain, and almost nobody demos that. Make sure you type an off-script question on purpose during the demo to show it off.
4. **One product, three audiences.** Resident → Board Desk → multi-community manager Portfolio is a coherent land-and-expand story: residents love it, boards adopt it, management companies pay for it.
5. **Presenter tooling.** The demo panel (roles, scenario toggles, live state pills, reset) is professional-grade demo prep. Tests (48 passing), clean types, error boundary, mobile-responsive frame — the engineering hygiene is well above prototype norm.

## Issues to fix before you demo (ranked)

**1. Role-switching doesn't close open sheets — demo-day landmine.** I reproduced this live: with the Ask AI sheet open, clicking a role in the demo panel swaps the world behind the sheet but leaves the sheet up. `pickRole` in `src/store/store.ts:674` resets `myPlaceOpen`/`portfolioOpen` but not `aiOpen`, `paySheetOpen`, `notifOpen`, `mapOpen`, etc. Mid-presentation, "now let's look at the manager view" with a stale owner sheet floating over it reads as broken. Fix: have `pickRole` (and Reset) close *every* overlay flag.

**2. Escape doesn't dismiss sheets.** Scrim-click works, but on a laptop demo the presenter will instinctively hit Esc. A single `keydown` listener in `Sheet.tsx`/`AiSheet.tsx` closing on Escape is cheap insurance (and an accessibility win).

**3. Onboarding is buried.** The onboarding flow only appears after Sign out → Sign in (`MyPlace.tsx:574` is the only entry). Onboarding is usually the strongest 30 seconds of a consumer-flavored pitch — household setup, interest circles, autopay opt-in tell the whole story. Add a "Replay onboarding" button to the demo panel so you can open with it.

**4. localStorage persistence can poison a live demo.** State persists across refreshes (good), but if you rehearse and forget to reset, the audience sees "Paid ✓, Voted ✓, all caught up" — the least interesting state. Consider a `?fresh` URL param that clears `pavilion-demo` on load, so the projector machine always starts clean.

**5. Demo choreography risk: happy-path state is a dead end.** Once you pay, vote, and fix the violation, Today collapses to "All caught up." That's a great *moment*, but plan the order: show the loaded Today screen first, then burn the cards down deliberately and end on all-clear. Consider a "Rewind to morning" scenario toggle so you can re-run the arc without a full reset (reset also nukes your role/scenario setup).

## Improvements that would raise the ceiling (post-demo roadmap)

- **Quantify the transparency story.** The Board Desk shows quorum and collection rates; add one "time saved" stat (e.g., "ARC average: 6 days vs. 34-day industry norm" — the pergola card already hints at this). ROI numbers are what management companies buy.
- **AI should act, not just answer.** The obvious "wow" upgrade: ask "Can I build a pergola?" and the AI answers from §4 *and offers to pre-fill the ARC request*. You have both pieces (AiSheet, ArcSheet); wiring one scripted handoff between them would be the most exciting 20 lines in the demo.
- **Delinquency with dignity as a named feature.** The payment-plan flow (3 × $190, no fees) is quietly the most humane thing here — surface it in the manager's aging view ("offer a plan" instead of "send to collections") to complete the story from both sides.
- **Accessibility pass before this becomes real.** Nearly every tappable row is a `div onClick` (see the `ROW` pattern in `Today.tsx`) — no keyboard focus, no roles/labels. Fine for a demo, table stakes for a product serving communities with many older residents. The `largeType` flag suggests you already care; follow through with buttons/aria when you productionize.
- **Store architecture will need a rethink at product stage.** A single flat store with ~230 fields of mostly sheet-open booleans is perfect for a demo (the demo panel depends on it) but won't survive contact with a backend. No action now — just don't let the prototype's shape dictate the real data model.
- **Small copy nit:** the group-chat auto-reply is always "👍 Sounds good!" — if you type into a group live, a second identical reply will expose the seams. One or two varied canned replies per group would keep the illusion.

## Bottom line

The vision — *HOA software that residents don't hate* — is real, differentiated, and legible within 60 seconds of opening the app, which is exactly what a demo needs. Presentation risk lives in state management around the demo panel (items 1–4 above), all fixable in under an hour. Fix those, open with onboarding, close on "all caught up," and deliberately ask the AI something it can't answer. That's a demo that gets remembered.
