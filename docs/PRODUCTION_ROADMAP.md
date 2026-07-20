# Pavilion — From Demo to Product

Game plan for keeping the demo alive forever while building the real,
Supabase-backed, multi-tenant app on the same codebase — engineered so that
components, design, and colors stay cheap to change as we learn what the
product actually is.

_Last updated: 2026-07-20_

---

## Guiding principles

1. **One codebase, two runtimes.** The demo and the real app share the same
   screens, components, and design. They differ only in where data comes from
   (in-memory mock vs. Supabase) and whether there's real auth. We never fork
   into two divergent apps.
2. **The demo is a permanent product surface**, not throwaway. It's how we
   sell, onboard boards, and pitch. It must keep working with zero backend and
   be shareable from a stable URL.
3. **Design is data.** Colors, spacing, radii, and type live in tokens, not in
   1,043 inline hex strings. Changing the look is editing one file, not 43.
4. **The UI never imports data.** Screens talk to a repository interface.
   Behind it is either the mock provider (demo) or the Supabase provider
   (live). This is the single most important refactor.
5. **Ship the smallest real slice first.** Auth + one community + one workflow
   (reservations) end-to-end beats a half-wired schema for everything.

---

## Current state (what we're starting from)

- Pure React 19 / TS / Vite SPA, no backend. Deploys `dev` → Vercel.
- **Single Zustand store** (`src/store/store.ts`, ~830 lines) holding *all*
  demo state, persisted to `localStorage` under key `pavilion-demo`.
- **Mock data** in `src/data/*` (amenities, vendors, groups, docs, notifs…),
  re-exported through `src/data/index.ts`.
- **Design**: Tailwind color palette in `tailwind.config.ts` + keyframes in
  `index.css`, but **1,043 hardcoded hex values inline across 43 files** — the
  palette is largely bypassed.
- Three roles today (owner / tenant / manager) driven by `state.role`, gated
  with `state.role === 'owner'` checks in screens.
- Good test coverage (Vitest + Playwright e2e).

---

## Target architecture

```
                     ┌───────────────────────────────┐
                     │        Screens / Sheets        │  (unchanged UI)
                     └───────────────┬───────────────┘
                                     │ hooks: useReservations(), useDues()…
                     ┌───────────────▼───────────────┐
                     │      Repository interface       │  src/data/repo/
                     │  (typed methods, no impl leak)  │
                     └───────┬───────────────┬────────┘
                             │               │
              ┌──────────────▼──┐     ┌──────▼──────────────┐
              │  MockRepository  │     │ SupabaseRepository  │
              │ (current data +  │     │ (RLS-scoped queries │
              │  Zustand demo)   │     │  + realtime)        │
              └──────────────────┘     └─────────┬───────────┘
                                                  │
                                        ┌─────────▼─────────┐
                                        │     Supabase      │
                                        │ Postgres + Auth + │
                                        │ Storage + RLS +   │
                                        │ Edge Functions    │
                                        └───────────────────┘
```

**Runtime selection** via env: `VITE_APP_MODE=demo | live`. Demo build wires
the MockRepository; live build wires SupabaseRepository behind auth. Same
bundle can support both with a runtime flag if we prefer a single deploy.

---

## Phase 0 — Design system foundation (do this first; unblocks everything)

Goal: make "change a color / component / spacing" a one-file edit. This pays
for itself immediately because we'll be redesigning constantly.

1. **Tokenize the palette.** Define semantic CSS variables on `:root` in
   `index.css` (or a `tokens.css`):
   - Raw ramp: `--navy`, `--cream`, `--ember`, `--sage`, `--gold`, …
   - Semantic aliases: `--color-bg`, `--color-surface`, `--color-primary`,
     `--color-text`, `--color-accent`, `--color-danger`, `--color-success`.
   Screens should reference *semantic* tokens so a rebrand is trivial.
2. **Wire Tailwind to the variables.** Change `tailwind.config.ts` colors to
   `rgb(var(--navy) / <alpha-value>)` form so `bg-navy`, `text-primary`, etc.
   all resolve to tokens. Now every existing utility class is themeable.
3. **Codemod the 1,043 inline hexes.** Script a mapping (hex → token) and
   replace inline `style={{ color: '#1A3352' }}` and `#hex` literals with
   token utilities or `var(--…)`. Do it file-by-file with tests green after
   each. This is a mechanical, subagent-friendly task.
4. **Theme provider.** A tiny `ThemeProvider` that sets token values on a root
   element. Enables: (a) instant rebrand, (b) **per-community theming** later
   (each HOA can have its own brand color), (c) dark mode if we want it.
5. **Component inventory.** The `src/components/*` library is already solid.
   Document each (props, variants) in a `docs/COMPONENTS.md` or a lightweight
   Storybook-style gallery route (`/kitchen-sink`) so design iteration has a
   single place to see everything.

**Exit criteria:** changing `--color-primary` restyles the whole app; no raw
hex remains in screens/sheets; component gallery renders every primitive.

---

## Phase 1 — Data layer seam (decouple UI from the mock)

Goal: the UI stops importing `src/data/*` and the demo store's domain data
directly. Everything goes through typed repository hooks.

1. **Define domain types** in `src/data/types.ts` (extend existing) as the
   contract: `Community`, `Unit`, `Membership`, `Amenity`, `Reservation`,
   `ArcRequest`, `Payment`, `Violation`, `Document`, `Group`, `Message`,
   `Vote`, `Notification`.
2. **Repository interface** `src/data/repo/Repository.ts` — method per read/
   write, all `Promise`-returning and async-shaped even in the mock, so the
   Supabase swap needs no UI change:
   ```ts
   interface Repository {
     listAmenities(communityId: string): Promise<Amenity[]>;
     createReservation(input: NewReservation): Promise<Reservation>;
     // …
   }
   ```
3. **MockRepository** implements it over the current `src/data` + Zustand demo
   state. Preserves today's demo behavior exactly (instant, optimistic).
4. **Refactor screens** to consume `useReservations()` / `useDues()` hooks
   that call the injected repository, not `import { AMENS } from '../data'`.
   Do it screen-by-screen; keep both paths working via the mock the whole time.
5. **Split the god-store.** Keep *ephemeral UI state* (sheet open/closed,
   inputs, active tab) in Zustand. Move *domain data* behind the repository.
   Consider TanStack Query for the live repo's caching/invalidation; the mock
   can resolve synchronously.

**Exit criteria:** flip `VITE_APP_MODE` and the app runs identically on the
MockRepository; no screen imports raw data modules.

---

## Phase 2 — Supabase backend

Goal: real, multi-tenant, secure data. **Multi-tenancy from day one** — every
row is scoped to a `community_id`; RLS enforces it.

### Schema (first cut)

- `communities` (id, name, brand tokens/logo, settings)
- `units` (id, community_id, address, …)
- `profiles` (id → auth.users, name, avatar)
- `memberships` (profile_id, community_id, unit_id, role: owner|tenant|manager,
  status) — **this drives roles & access, replacing `state.role`**
- `amenities`, `reservations`
- `arc_requests`, `arc_reviews`
- `dues`, `payments`, `special_assessments`
- `violations`
- `documents` (+ Supabase Storage bucket)
- `groups`, `group_members`, `messages`, `polls`, `poll_votes`, `events`
- `announcements` / `broadcasts`, `notifications`

### Security & access

- **RLS on every table**, policies keyed on `memberships` (you can only see/act
  within communities you belong to; manager role unlocks board actions).
- **Supabase Auth**: email magic-link or OTP to start; add SSO later. Roles come
  from `memberships`, not JWT claims, so a person can be owner in one community
  and manager in another.
- **Advisors check** (`get_advisors`) after each migration for security/perf.

### Server logic

- **Edge Functions** for: payment webhooks (Stripe), AI Q&A over documents
  (the "ask the docs" feature — RAG with pgvector over `documents`), scheduled
  digests/reminders.
- Keep the AI assistant's document-cited answers real: embed docs into
  `pgvector`, retrieve + cite, matching the demo's behavior.

### Deliverables

- Migrations checked into `supabase/migrations/`.
- Generated TS types (`generate_typescript_types`) feeding the repo interface.
- **SupabaseRepository** implementing `Repository` against the above, with
  realtime subscriptions for chat/notifications.
- Seed script that loads the *demo* community ("Juniper Ridge") into a real
  project so live mode has something rich to show.

**Exit criteria:** live mode with real auth performs the full reservations +
dues + ARC flows for a seeded community, RLS-verified across two roles.

---

## Phase 3 — Keeping the demo alive forever

The demo is a first-class artifact. Options (recommended in bold):

- **Same repo, `VITE_APP_MODE=demo` build, deployed to its own stable URL**
  (e.g. `demo.pavilion.app`). It uses the MockRepository, needs no backend, no
  auth, and the DemoPanel presenter controls stay. Because it shares components
  and tokens, every design improvement to the product automatically upgrades
  the demo.
- Alternative: freeze the current demo as a tagged build on a separate Vercel
  project so it can *never* break, and let the shared-codebase demo evolve. Do
  both — a frozen "pitch build" + a living demo — if stability matters for
  sales.

Guardrails:
- Demo mode must have **zero** Supabase imports at runtime (tree-shaken by the
  mode flag) so it can't leak keys or make network calls.
- A CI check that the demo build succeeds and e2e passes on every PR.

---

## Phase 4 — Production readiness for real users

- **Environments**: `demo`, `staging` (Supabase branch), `prod` (Supabase
  prod project). Use Supabase branching for preview DBs per PR.
- **Payments**: Stripe (dues, special assessments, autopay). Webhooks → Edge
  Function → `payments`.
- **Notifications**: email (Resend/Postmark) + push (web push / native later).
- **Observability**: Sentry for FE errors, Supabase logs/advisors, uptime.
- **Compliance & data**: privacy policy, ToS, data export/delete (the demo
  already has an Export flow — make it real), audit trail on board actions.
- **Accessibility**: keep the large-type toggle; audit contrast against the new
  tokens; keyboard/focus states.
- **Onboarding**: community creation + invite flow (managers invite owners;
  owners claim units). The demo's onboarding is a great UX spec to build against.
- **Analytics**: privacy-respecting product analytics to learn what to build.

---

## Phase 5 — Iteration loop (why the token/repo work matters)

Once Phases 0–1 land, the product-discovery loop is cheap:
- Change look/brand → edit tokens.
- Try a new component variant → edit the primitive, gallery shows it everywhere.
- Add/redesign a feature → change the repo interface + one screen; mock and
  Supabase impls updated in parallel; demo and live both benefit.

---

## Sequenced milestones

| # | Milestone | Blocks |
|---|-----------|--------|
| M0 | Design tokens + Tailwind wired to vars + hex codemod + component gallery | everything |
| M1 | Repository interface + MockRepository; screens off raw data imports | M2 |
| M2 | Demo deployed to stable URL in `demo` mode; CI guard | sales-ready |
| M3 | Supabase project, schema, RLS, Auth; seed Juniper Ridge | M4 |
| M4 | SupabaseRepository; ARC + Commons/Groups + board features live end-to-end | pilot |
| M5 | Reservations + dues live; notifications, onboarding/invites, observability | GA-prep |
| M5b | Payments (Stripe) fast-follow once pilot community is live | GA |
| M6 | Per-community theming, RAG doc-AI, native/push | scale |

---

## Locked decisions (2026-07-20)

1. **Demo deployment — both.** Ship (a) a *frozen pitch build* tagged and
   deployed to its own Vercel project that can never break, and (b) a *living
   demo* on the shared codebase (`VITE_APP_MODE=demo`) that evolves with the
   product. Sales always has a stable link; the living demo showcases progress.
2. **Deployment — separate deploys, shared code.** `demo.pavilion.app` and
   `app.pavilion.app` build from one repo, selected by `VITE_APP_MODE`. The
   demo bundle tree-shakes out all Supabase code so no keys/network can leak.
3. **First real slice — ARC + Commons/Groups + board features.** Harden these
   end-to-end first (payment-light, but they exercise auth, multi-role RLS, the
   board/manager permission model, and realtime chat/polls). Reservations + dues
   follow once the role/RLS foundation is proven.
4. **Payments — fast-follow.** Auth + core workflows ship first; Stripe (dues,
   special assessments, autopay) lands once a pilot community is live. Keeps
   compliance/webhook complexity off the critical path.
5. **Role model — resident + board only (no professional management yet).**
   High-level user types are **resident** and **board**. We are *not* building
   the professional community-management surface (multi-community portfolio,
   management-company tooling) for now. The `memberships.role` enum starts as
   `resident | board`; the demo's `manager`/Portfolio surface is deprioritized
   and will be hidden/removed from the product path (it can stay in the frozen
   pitch build if useful). Self-managed HOAs are the target; managed-HOA /
   professional-manager support is a later, additive phase.

## Still open (need product input)

- _(none blocking — role model locked 2026-07-20)_
