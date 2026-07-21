# Pavilion v2

React 19 + TypeScript + Vite + Zustand + Tailwind SPA with a dual backend:
**demo mode** (default, in-memory, scripted presenter demo) and **live mode**
(Supabase + RLS), selected by `VITE_APP_MODE` at build time.

## Commands

- `npx vitest run` — run all tests (must stay green before every commit)
- `npm run build` — type check + production build (Vercel runs this; `npx vite build` alone skips tsc)
- `npx vite --host` — dev server

## Branches & deploys

- `dev` → Vercel production = the **presenter demo** (demo mode).
- `staging` → live mode against the `pavilion-dev` Supabase project.
  `.env.production` (VITE_APP_MODE=live + Supabase creds) exists **only on
  `staging`** — never merge `staging` into `dev`, merge the feature branch
  into each instead.

## Architecture — the Repository seam

Screens never import backend code or seed data directly. They call hooks
(`src/data/repo/hooks.ts`: `useDues`, `useVotes`, `useArc`, `useMember`, …)
backed by the `Repository` interface (`src/data/repo/Repository.ts`) with two
implementations:

- `MockRepository` — demo. Derives domain state from the Zustand store's
  scenario flags (memoized on a flag-signature string so references stay
  stable for `useSyncExternalStore`). The DemoPanel drives those flags.
- `SupabaseRepository` — live. RLS-scoped queries into a per-domain cache,
  hydrated on auth change; every domain fails soft to empty when the member
  has no data. A fresh community must render honest empty states everywhere.

Rules when adding features:
1. New domain data goes through the seam: type + method on `Repository`,
   both implementations, a hook, screen reads the hook.
2. Demo-only flourishes (scripted AI, fake finance panels, meeting prep) are
   gated behind `repo.isDemo()` — never let fabricated numbers render in live.
3. The presenter demo must stay byte-for-byte unchanged unless asked.
4. Supabase DDL: write a migration in `supabase/migrations/`, hand-add the
   table types to `src/data/repo/database.types.ts` (alphabetical, compact
   single-line style), and **ask before applying** migrations to the project.
   RLS helpers live in the non-API `private` schema (`is_member`, `is_board`,
   `owns_unit`, `current_profile_id`).

Other landmarks:

- `src/store/store.ts` — Zustand store: UI/sheet state + demo scenario flags,
  localStorage-persisted
- `src/screens/` — tab screens · `src/sheets/` — bottom sheets ·
  `src/components/DemoPanel.tsx` — presenter controls (Ctrl+Shift+D)
- Demo roles: owner (default), tenant, manager. Live roles come from the
  `memberships` table: `resident` | `board`.
- `docs/PRODUCTION_ROADMAP.md` — phased plan; Phase 2 write paths are current.

## Cost & Context Management

- **Use cheaper subagents** (model: "haiku" or "sonnet") for tasks that don't require deep reasoning: file lookups, grep searches, simple code generation, test writing, formatting. Reserve the primary model for architectural decisions, complex debugging, and nuanced UX work.
- **Minimize context usage.** Read only the lines you need (use `offset`/`limit`). Don't re-read files you've already seen unless the content changed. Don't dump entire files into context when a targeted grep or a 20-line read suffices.
- **Prefer Grep/Glob over Bash** for search. Prefer Edit over Write for modifications. These are cheaper operations.
- **Don't re-derive established facts.** If something was already confirmed (tests pass, types clean, file structure known), don't re-verify unless something changed.
- **Keep agent prompts tight.** When spawning subagents, give them exactly what they need — file paths, line numbers, specific instructions — not open-ended exploration.
- **Batch independent tool calls** in parallel to reduce round trips.

## Design System

Warm earth tones: navy `#1A3352`, cream `#F5F0E6`, ember `#C75A31`, sage `#2A9D5C`, gold `#D9A441`. Phone frame 393x830.
