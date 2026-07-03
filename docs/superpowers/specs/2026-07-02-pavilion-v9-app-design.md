# Pavilion v9 — Production App Design

**Date:** 2026-07-02
**Source of truth:** `project/Pavilion App v9.dc.html` (Claude Design handoff bundle)
**Goal:** Portfolio/demo piece — a pixel-faithful, fully interactive rebuild of the v9 prototype, deployed on Vercel. Supabase and real integrations deferred to Phase 2. App-store path kept open via Capacitor.

## 1. Scope decisions (settled with Nate)

| Question | Decision |
|---|---|
| Purpose | Portfolio/demo piece, seeded with Juniper Ridge demo data |
| Backend depth | Mostly client state, like the prototype |
| Penny (AI assistant) | Scripted Q&A with typing animation (no API keys, no cost) |
| Supabase in v1 | Skipped. Data layer isolated so Supabase becomes a Phase 2 swap |
| Stack | Vite + React 18 + TypeScript SPA (Approach A) |
| Future native app | Same codebase wrapped with Capacitor later; PWA manifest in v1 |

## 2. What we're building

A mobile-first HOA/community app with three switchable roles (Owner / Tenant / Property Manager) and the full v9 surface:

- **Today** — dashboard: alert banner, needs-you cards (vote, dues, ARC, violation, special assessment), Penny nudge, events, map teaser, new-neighbor wave
- **Commons** — feed (shoutouts / help & borrow / events, likes + comments), Circles hub, People directory, Free table, private report entry point
- **Reserve** — amenity list + detail booking flow (day / slot / duration, waitlists), guest pass sheet with QR
- **HOA** — open vote with live quorum + tally, dues breakdown, reserve forecast, ARC cards with status timeline, known issues, decisions log, documents (search, §4 diff view), annual meeting (agenda, hand-raise, proxy)
- **Penny** — bottom-sheet chat: 3 scripted Q&A chips, free-typed input gets the "I won't guess — pass to the board?" fallback, doc-summary flow, citation chips that deep-link to the doc reader
- **Board desk** (Treasurer) — Desk / Requests / Money / Comms tabs: triage, ARC approval, vendor scheduling + COI, collections, aging report + export sheet (QuickBooks/CSV, simulated), invoice signing, broadcast, vote drafting, minutes publishing
- **Manager portfolio** — 3-community dashboard drilling into each board desk
- **Overlays** — Pay sheet (dues, past-due plan), ARC sheet, Report sheet, Guest pass, Violation notice, Special assessment, Export, Search, Notifications (with category muting), Messages inbox + 1:1 chat, My Place (profile, household, vehicles/pets, payments, settings), Map (layer chips + pins), Onboarding (5 steps), Sign-in
- **Scenario switches** — the prototype's props (role, showDelinquent, showSpecialAssessment, showViolation, showAlert, startTab) become a small "demo controls" panel so viewers can explore scenarios, mirroring the design-brief panel on desktop

Fidelity bar: recreate the prototype pixel-perfectly (per the handoff README) — including animations: sheet slide-up, screen pop, confetti bursts, heart pop, typing bounce, Penny orb glow, reduced-motion support.

## 3. Architecture

Vite + React 18 + TypeScript SPA. No server. Deployed as a static site on Vercel.

```
src/
  theme/        design tokens: colors (navy #1A3352, cream #F5F0E6, ember #E06A3E,
                terracotta #C75A31, sage #2A9D5C, gold #D9A441 …), fonts
                (Young Serif / Nunito Sans), radii, shadows, keyframes
  data/         typed Juniper Ridge seed data: amenities, search index, vendors,
                directory, free-table, pins, portfolio, aging, circles, notifs,
                chat seeds, docs, Penny QA — the ONLY layer Supabase replaces later
  store/        one Zustand store mirroring the prototype state machine
                (role, tab, sheets, votes, bookings, waves, claims, board state …)
  components/   shared primitives: Sheet, Chip/ChipRow, SegmentedControl, Toggle,
                ProgressBar, StatusTimeline, Confetti, TypingDots, Card, NavDock,
                PhoneFrame, Avatar, Pill
  screens/      Today, Commons, Reserve, Hoa, BoardDesk, Portfolio, MyPlace, Map,
                Notifications, Messages, Chat, Documents, Circle, Events, Meeting,
                Onboarding, SignIn, Search
  sheets/       PaySheet, ArcSheet, PennySheet, ReportSheet, PassSheet, ViolSheet,
                SASheet, ExportSheet
  App.tsx       layout: desktop = brief panel + 393×830 phone frame; real mobile =
                full-bleed app
```

- **Styling:** Tailwind with the token palette in config; the few bespoke animations as CSS keyframes (scPop, sheetUp, confettiPop, heartPop, typingBounce, orbGlow) with `prefers-reduced-motion` guard.
- **State:** derived values (quorum %, triage counts, aging, attention summary) computed in selectors, exactly as the prototype's `renderVals()` does.
- **Icons:** `@phosphor-icons/react` (same glyph set as the prototype).
- **Fonts:** Google Fonts (Young Serif, Nunito Sans) — self-hosted via `@fontsource` so the PWA works offline.
- **Routing:** no router needed v1 — the store's `tab` + overlay flags drive rendering, matching the prototype. (Adding React Router later is additive.)
- **PWA:** `vite-plugin-pwa` — installable, offline-capable, real app icon (the Pavilion pavilion-glyph from the bundle thumbnail).

## 4. Data flow

Seed data (read-only constants) → Zustand store (session state) → screens/selectors → UI. All mutations are store actions (`vote('yes')`, `bookSlot(...)`, `submitArc(...)`). Nothing persists across reloads in v1 (matching the prototype); `persist` middleware can be enabled trivially if we want state to survive refresh.

**Phase 2 seam:** every screen consumes data through hooks (`useAmenities()`, `useNotifications()` …) that today read constants. Supabase replaces the hook internals; screens don't change.

## 5. Error handling

No network, no auth, no payments in v1 — error surface is minimal by design:
- Disabled-state buttons (pick-a-time-to-book, pick-a-category) follow the prototype's grey-out pattern.
- An ErrorBoundary wraps the phone frame with a friendly reset card so a crash never blanks the demo.
- Simulated actions (pay, export, broadcast) always succeed, as in the prototype.

## 6. Testing

- **Vitest + React Testing Library** for the store and key flows: vote → quorum increments; book → booking card appears everywhere; ARC submit → appears in board triage → approve → resident sees Approved; role switch gates owner-only cards; delinquent scenario changes pay sheet.
- **Playwright smoke test** (one spec): walk each tab + open each sheet, assert no crash.
- Visual fidelity is checked against the prototype HTML sections during implementation (the source spells out every dimension/color).

## 7. Deployment

- GitHub repo → Vercel (framework preset: Vite). `vercel.json` not required.
- Production URL is the shareable portfolio link; desktop visitors see the brief panel + phone frame, mobile visitors get the app full-bleed.

## 8. Phases (future, out of v1 scope)

1. **v1 (this spec):** faithful interactive demo on Vercel.
2. **Phase 2 — Supabase:** schema for households/units/votes/bookings/posts/tickets; swap data hooks; demo login ("view as" seeded users); shared-state demo moments.
3. **Phase 3 — Real Penny:** Vercel serverless route → Claude API grounded in the CC&R document, citations preserved.
4. **Phase 4 — App store:** Capacitor wrap (iOS/Android), push notifications, native share sheet.
