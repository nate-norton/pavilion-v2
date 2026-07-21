# design-sync notes — Pavilion Design System

Repo-specific gotchas for future syncs to claude.ai/design.

## Shape: package (synth-entry over an application repo)

Pavilion v2 is a **Vite SPA, not a published component library** — there is no
dist library entry. So we do NOT use pure synth-entry (which would `export *`
all of `src/`, dragging in screens, the Zustand store, and the Supabase
client). Instead:

- **`entry` = `.design-sync/pavilion-entry.tsx`** — a hand-written barrel that
  re-exports only the 11 public primitives (+ `ThemeProvider`). Add a new
  primitive here AND to `componentSrcMap` to card it.
- **`componentSrcMap`** pins each component's `srcPath`. This drives both the
  component list and `<Name>Props` extraction (ts-morph reads these files).
  App chrome/infra (`DemoPanel`, `ErrorBoundary`, `Overlays`, `NavDock`,
  `PhoneFrame`, `Sheet`, `Confetti`) is intentionally excluded.

## Styling — stable stylesheet is generated, not the raw source

- Tokens live as CSS vars in `src/index.css` `:root`; components style via
  **Tailwind utility classes** → those vars. The raw `src/index.css` has
  unexpanded `@tailwind` directives, so it is NOT usable as `cssEntry`.
- `cssEntry = .design-sync/style/pavilion.css` — a **generated** copy of the
  compiled Vite CSS (`dist/assets/index-*.css`) with Vite's absolute
  `/assets/` font URLs rewritten to sibling-relative so the converter can copy
  the woff2/woff files. Regenerate with **`node .design-sync/make-css.mjs`**
  (part of `buildCmd`). Output dir `.design-sync/style/` is gitignored.
- The compiled CSS is Tailwind-**purged** against `src/**`, so every component
  class is present, but classes invented only in previews would be purged —
  **author preview layout glue with inline styles**, not new utility classes.
- No provider needed for default rendering: `:root` in the compiled CSS defines
  every token, so components render styled standalone. `ThemeProvider` only
  *overrides* tokens (brand switching) — not required for previews.

## Fonts

Young Serif (serif/display) + Nunito Sans (sans/body), shipped via
`@fontsource/*` and bundled into the compiled CSS by Vite. `make-css.mjs`
copies all woff2/woff next to the stylesheet, so the converter ships them —
no `extraFonts` needed.

## Re-sync risks (watch-list)

- **Vite content hashes**: `dist/assets/index-*.css` and the font filenames are
  content-hashed. `buildCmd` runs `npm run build` then `make-css.mjs` to
  refresh the stable copy — always run the full `buildCmd`, never point
  `cssEntry` at a stale hash.
- **New primitive drift**: a component added to `src/components/` and to the
  in-app gallery (`src/gallery/DesignSystem.tsx`) will NOT sync until it is
  added to `pavilion-entry.tsx` + `componentSrcMap`.
- Preview authoring uses inline styles for glue (see above) — safe against
  Tailwind purge, but means preview layout is not itself token-driven.

## Known render warns (benign — confirmed by screenshots)

- **[TOKENS_MISSING] `--tw-shadow-color`, `--tx`, `--ty`, `--rot`** — Tailwind's
  internal shadow var + Confetti's runtime inline animation vars. Never defined
  in a stylesheet by design; set at runtime. Not a defect.
- **[RENDER_THIN] PhIcon** — the thin check flags "no text nodes," but PhIcon
  renders SVG glyph paths (no text). The screenshot paints icons correctly
  across all three cells (Sampler/Weights/Colors). False positive.

## Playwright / render check

The pre-installed Chromium (`/opt/pw-browsers`) is build 1194 with the older
`chrome-linux/headless_shell` layout, while the repo's `playwright-core` pins
build 1228. Run validate/capture with **`DS_CHROMIUM_PATH=/opt/pw-browsers/chromium`**
(the full-chromium symlink) so `executablePath` bypasses the version-pinned
browser lookup. Both `package-validate.mjs` and `package-capture.mjs` honor it.
