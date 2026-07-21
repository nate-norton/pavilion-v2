# Pavilion

Community life, in one place. Pavilion is an HOA / community-management app:
residents pay dues, vote, reserve amenities, report issues, and talk to their
neighbors; boards triage reports, run votes, track money, and communicate —
courtesy-first, everything in the open.

One codebase serves two experiences:

- **Demo mode** (default) — a fully scripted, presenter-driven product vision.
  No backend, no auth; every flow works instantly against in-memory data, with
  a presenter control panel (Ctrl+Shift+D) for roles and scenarios.
- **Live mode** — the real product against Supabase (auth, multi-tenant data,
  row-level security). A fresh community starts genuinely empty and fills up
  as members and boards use it.

## Stack

React 19 · TypeScript · Vite · Zustand · Tailwind · Supabase (live mode) ·
Vitest + Testing Library · Playwright · deployed on Vercel.

## Quick start

```bash
npm install
npx vite --host        # dev server (demo mode by default)
npx vitest run         # unit/component tests
npm run build          # type-check + production build
```

To run live mode locally, copy `.env.example` to `.env.local` and set
`VITE_APP_MODE=live` (the Supabase URL + publishable key in the example file
point at the dev project; RLS protects the data, not key secrecy).

## How the two modes share one app

Screens never touch a backend directly. They read/write through a single
`Repository` interface (`src/data/repo/`) via hooks:

```
screens → hooks (useDues, useVotes, …) → Repository
                                          ├── MockRepository      (demo: in-memory, scripted)
                                          └── SupabaseRepository  (live: RLS-scoped queries)
```

`VITE_APP_MODE` selects the implementation at build time. Because both
implementations satisfy the same contract, every design or feature change to a
screen upgrades the demo and the product simultaneously — and demo-only
flourishes are gated behind `repo.isDemo()` so live mode shows honest empty
states instead of fabricated data.

## Domains, branches & deploys

Everything lives under **pavilion.community**, split across three Vercel
projects:

| URL | Vercel project | Branch | Mode | What it is |
|-----|----------------|--------|------|------------|
| [pavilion.community](https://pavilion.community) | `pavilion-website` | `main` (own repo) | — | Marketing site (the front door) |
| [app.pavilion.community](https://app.pavilion.community) | `pavilion-v2` | `staging` | live | The product — Supabase-backed |
| [demo.pavilion.community](https://demo.pavilion.community) | `pavilion-v2-demo` | `dev` | demo | The presenter demo — stable sales link |

The app and the demo build from this same repo, so every improvement ships to
both. Feature branches merge to `staging` (deploys the app) and to `dev`
(deploys the demo). Never merge `staging` into `dev` — the live-mode config
(`.env.production`) is committed only on `staging`, and merging it across
would flip the demo into live mode. `pavilion-community.com` redirects to
pavilion.community.

## Backend (live mode)

Supabase, multi-tenant from day one: every row scopes to a `community_id`, and
RLS policies (keyed on `memberships`, with helper functions in a non-API
`private` schema) enforce who sees what. Migrations live in
`supabase/migrations/`; generated types in `src/data/repo/database.types.ts`.
Auth is email magic-link; roles (`resident` | `board`) come from memberships,
not JWT claims.

## Project layout

- `src/screens/` — main tab screens (Today, Reserve, Commons, Hoa, MyPlace, BoardDesk, …)
- `src/sheets/` — bottom-sheet overlays
- `src/components/` — shared primitives + `DemoPanel` presenter controls
- `src/data/repo/` — the Repository seam (contract, mock, Supabase, hooks)
- `src/store/store.ts` — Zustand store (UI state + demo scenario flags)
- `supabase/` — migrations and seed
- `docs/PRODUCTION_ROADMAP.md` — phased plan from demo to production

## Status

Phases 0–1 (design tokens, repository seam) are complete. Phase 2 (Supabase
backend) has schema, RLS, auth, and data-driven reads for all domains live;
write paths are the current work. See the roadmap for what's next.
