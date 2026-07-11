# Pavilion v2

React 19 + TypeScript 6 + Vite 8 + Zustand 5 + Tailwind 3 SPA. No backend. Deploys from `dev` branch to Vercel.

## Commands

- `npx vitest run` — run all tests
- `npx tsc --noEmit` — type check
- `npx vite build` — production build
- `npx vite --host` — dev server

## Cost & Context Management

- **Use cheaper subagents** (model: "haiku" or "sonnet") for tasks that don't require deep reasoning: file lookups, grep searches, simple code generation, test writing, formatting. Reserve the primary model for architectural decisions, complex debugging, and nuanced UX work.
- **Minimize context usage.** Read only the lines you need (use `offset`/`limit`). Don't re-read files you've already seen unless the content changed. Don't dump entire files into context when a targeted grep or a 20-line read suffices.
- **Prefer Grep/Glob over Bash** for search. Prefer Edit over Write for modifications. These are cheaper operations.
- **Don't re-derive established facts.** If something was already confirmed (tests pass, types clean, file structure known), don't re-verify unless something changed.
- **Keep agent prompts tight.** When spawning subagents, give them exactly what they need — file paths, line numbers, specific instructions — not open-ended exploration.
- **Batch independent tool calls** in parallel to reduce round trips.

## Design System

Warm earth tones: navy `#1A3352`, cream `#F5F0E6`, ember `#C75A31`, sage `#2A9D5C`, gold `#D9A441`. Phone frame 393x830.

## Architecture

- `src/store/store.ts` — single Zustand store with localStorage persistence
- `src/components/PhoneFrame.tsx` — app shell
- `src/screens/` — main tab screens (Today, Reserve, Commons, Hoa, MyPlace, BoardDesk, Portfolio)
- `src/sheets/` — bottom sheet overlays
- `src/components/DemoPanel.tsx` — presenter controls (Ctrl+Shift+D to toggle)
- Three roles: owner (default), tenant, manager
