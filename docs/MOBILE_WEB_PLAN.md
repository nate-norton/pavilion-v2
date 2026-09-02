# Mobile web plan — making the browser the first-class target

> **Status: implemented.** All six phases landed in one change. The three open
> decisions in §4 were resolved as recommended: 16px fields accepted, page mode
> extended past a pure width query to `(pointer: coarse) and (max-height:
> 500px)` so landscape handsets get it, and one mobile layout shared with
> standalone rather than two maintained. `DESIGN.md` (Layout → Frame mode and
> page mode) is the living description; what follows is the review that
> motivated it, kept as the record of why.
>
> One thing the plan did not foresee: once the frame stopped being a clipping
> box, the tab-change slide's 40px translate gave the page a transient
> horizontal scrollbar. The frame now clips its inline axis with
> `overflow-x: clip` — `hidden` would have made the block axis a scroll
> container again and undone the whole fix.

Pavilion ships a PWA manifest, but the realistic assumption is that ~99% of
residents will open it in Safari or Chrome from an invite link or an SMS
notice and never install anything. Today the layout is built for the
*installed* case and merely tolerates the browser one. This plan flips that:
the browser becomes the target the layout is designed against, and standalone
mode becomes the easy special case (it only ever has *less* chrome).

Everything below is scoped to narrow viewports (`max-width: 500px`). The
393x830 phone-frame presentation used by the presenter demo and by desktop
visitors is untouched, per CLAUDE.md rule 3.

---

## 1. Review — what's actually wrong today

### 1.1 The browser toolbar can never collapse (the headline issue)

`PhoneFrame` pins itself to `h-dvh / max-h-dvh` at ≤500px, and every screen
scrolls inside `absolute inset-0 overflow-y-auto pav-scroll`
(`src/screens/Today.tsx:100`, `Commons.tsx:56`, `Hoa.tsx:77`,
`Reserve.tsx:84,264`, plus secondary screens).

iOS Safari and Chrome for Android collapse their toolbars **only** in
response to scrolling the root document scroller. Pavilion's root document is
exactly one viewport tall and never scrolls, so from the browser's point of
view the page is a static poster. Consequences:

- The bottom toolbar (Safari, ~50–56px) and the URL bar stay expanded for the
  entire session. On a 393x852 iPhone that is a permanent ~15% of the screen
  the app can never win back — the exact thing that makes an app-shaped web
  page feel like a web page.
- Tapping the iOS status bar to scroll to top does nothing (it targets the
  root scroller), which reads as the app being broken.
- `100dvh` is doing nothing useful: because the toolbar never collapses,
  `dvh` is permanently equal to `svh`. We pay for the dynamic unit and get
  none of its benefit.

This is not fixable with CSS units, a meta tag, or JS — browsers deliberately
expose no API for it. **The only fix is to make the document itself the
scroller on narrow viewports.**

### 1.2 Layout constants assume a drawn phone, not a real one

Every screen root hardcodes `padding: '64px 18px 150px'`. The 64px top exists
to clear the *illustrated* status bar inside the 393x830 frame. On a real
phone in a browser, the browser's own chrome already occupies that band, so
we are spending ~46px of vertical space clearing a status bar that isn't
there. The 150px bottom is a magic number for the dock that no longer matches
anything measurable.

Neither value consults `env(safe-area-inset-*)`. `viewport-fit=cover` is set
in `index.html`, so on a notched device in landscape — and in standalone mode
in portrait — content runs under the system UI with only `NavDock`
(`src/components/NavDock.tsx:63`) doing anything about it.

### 1.3 iOS zooms on every text field

All 76 inputs and textareas render at 12–13.5px (`text-[13px]` x30,
`text-[13.5px]` x7, `text-[12.5px]` x6, `text-[12px]` x1). iOS Safari
auto-zooms any focused field under 16px. The result: tapping a search box or
a message composer punches the layout up ~15%, pushing the fixed dock and the
right edge of cards off-screen, and the user has to pinch back out. This is
the single most likely "it looks cut off" report from a pilot.

### 1.4 Nothing handles the software keyboard

There is no `interactive-widget` directive and no `visualViewport` handling.
On Android Chrome the keyboard shrinks the visual viewport only, so the fixed
dock and the chat composer sit *behind* the keyboard. Chat, Messages and
BoardChat are the screens where this bites.

### 1.5 Overlays are frame-relative

`Sheet` (`src/components/Sheet.tsx:61`), `Overlays`, `AppToast` and
`ConfirmSheet` all position with `absolute inset-0` against the frame. That
is correct while the frame *is* the viewport; the moment the document
scrolls, an absolutely positioned scrim scrolls away with it. Sheets also
cap at `maxHeight: '90%'` and pad `pb-6` with no safe-area term, so on a
notched phone the last row of a sheet sits in the home-indicator strip.

### 1.6 Tablet / small-window dead zone

Between 501px and 1023px the desktop presentation applies:
`max-h-[calc(100vh-48px)]` on the frame (`PhoneFrame.tsx:53`) and
`calc(100vh - 48px)` in `index.css:276-277`. `100vh` on mobile browsers is
the *large* viewport — it includes the collapsed-toolbar height the browser
isn't currently giving us — so an iPad in portrait, or a phone in landscape,
gets a frame taller than the visible area, and the nav dock is clipped. These
should be `svh`.

### 1.7 Overscroll reveals the wrong thing

With no `overscroll-behavior`, rubber-banding past the end of an inner
scroller drags the whole fixed layout on iOS and exposes the `App`
background gradient. Once the document scrolls (§2), Android also gains an
accidental pull-to-refresh on a page where refresh is never the intent.

---

## 2. The plan

Six phases, ordered so that each one ships value on its own and the risky
refactor lands only after the harness exists to catch regressions.

### Phase 0 — Harness first (no product change)

Nothing else in this plan is verifiable by unit test; these are layout
behaviours. Before touching anything:

1. Add Playwright projects to `playwright.config.ts` for `iPhone 14`,
   `Pixel 7`, and `iPad Mini` (portrait + landscape), alongside the existing
   desktop run.
2. Add `e2e/mobile-layout.spec.ts` asserting, per device and per tab:
   - the nav dock's bounding box is fully inside `visualViewport`;
   - the last card in each scroller is reachable and not overlapped by the
     dock;
   - no horizontal document overflow (`scrollWidth <= clientWidth`);
   - with a sheet open, the scrim covers the full visual viewport.
3. Add an assertion that `document.scrollingElement.scrollHeight >
   innerHeight` on a content-heavy tab at ≤500px — this is the machine-
   checkable definition of "the toolbar can collapse", and it fails today.

**Deliverable:** a red test that Phase 2 turns green.

### Phase 1 — Safe-area and spacing tokens (low risk, ships alone)

Replace the magic numbers with tokens in `src/index.css :root`:

```css
--pav-safe-top:    env(safe-area-inset-top, 0px);
--pav-safe-bottom: env(safe-area-inset-bottom, 0px);
--pav-screen-top:    64px;                 /* drawn status bar, frame mode */
--pav-screen-bottom: 150px;                /* dock clearance, frame mode */
--pav-dock-offset:   14px;
```

and override them once, in a single `@media (max-width: 500px)` block:

```css
--pav-screen-top:    calc(18px + var(--pav-safe-top));
--pav-screen-bottom: calc(96px + var(--pav-safe-bottom));  /* 66 dock + 14 gap + 16 */
--pav-dock-offset:   calc(14px + var(--pav-safe-bottom));
```

Then change the ~9 screen roots from `padding: '64px 18px 150px'` to
`padding: 'var(--pav-screen-top) 18px var(--pav-screen-bottom)'`, and
`NavDock` to `bottom: var(--pav-dock-offset)`. Give `Sheet` a
`paddingBottom: calc(24px + var(--pav-safe-bottom))` and
`maxHeight: 90svh`.

Because the frame-mode values are byte-identical to today's constants, the
demo and desktop renders do not move a pixel — the tokens only *become*
different inside the mobile media query. Reclaims ~46px of vertical space on
every phone, and fixes standalone/landscape clipping outright.

Also in this phase: change `100vh` → `100svh` at `PhoneFrame.tsx:53` and
`index.css:276-277` to close the tablet gap (§1.6).

### Phase 2 — Make the document the scroller (the toolbar fix)

This is the substantive change. Introduce one component,
`src/components/ScreenScroll.tsx`, that owns the two layouts:

- **frame mode** (>500px, unchanged): `absolute inset-0 overflow-y-auto pav-scroll`
- **page mode** (≤500px): plain flow, `min-h-svh`, no overflow container —
  the document scrolls.

Migrate the 7 screen roots plus the secondary screens to it. Supporting
changes:

- `App.tsx`: at ≤500px drop the flex centering and let the wrapper be
  `min-h-svh` with the gradient as a fixed background layer, so overscroll
  never exposes bare white.
- `PhoneFrame.tsx`: at ≤500px the frame becomes `position: static; width:100%;
  height:auto; min-height:100svh` rather than `h-dvh`.
- The tab-slide wrapper (`key={tab}` + `absolute inset-0`) becomes relative in
  page mode; add an explicit `window.scrollTo(0, 0)` on tab change to preserve
  today's always-start-at-top behaviour (the keyed remount gives that for free
  in frame mode).
- `html { background: rgb(var(--mist)); overscroll-behavior-y: contain; }` at
  ≤500px — matches `theme-color`, kills the accidental Android pull-to-refresh,
  and makes the iOS rubber-band show mist instead of the gradient.

**Result:** scrolling any tab now scrolls the document, so Safari and Chrome
collapse their toolbars the way they do on every other site, and the status-bar
tap-to-top gesture starts working. The `dvh` units already in place finally
earn their keep as the chrome animates.

**Risk and mitigation:** this is the phase that can break layout at 29 scroll
sites. It lands behind the Phase 0 suite, is confined to the ≤500px branch,
and `isLiveMode`/frame mode is untouched, so the presenter demo cannot
regress.

### Phase 3 — Overlays become viewport-fixed

With the document scrolling, `Sheet`, `Overlays`, `AppToast`, `ConfirmSheet`
and `NavDock` must be `fixed` rather than `absolute` in page mode. Two extra
details:

- Lock the body while a sheet is open (`position: fixed` + stored scrollY
  restore on close) so the page behind doesn't scroll under the scrim — the
  standard iOS scroll-lock dance, in one hook.
- Sheet panel scroll needs `overscroll-behavior: contain` so flicking past the
  end of a sheet doesn't chain into the page.

### Phase 4 — Inputs and the software keyboard

1. **Stop the iOS zoom.** Raise every input/textarea to `font-size: 16px`.
   Doing it as a global rule in `index.css` (`input, textarea, select {
   font-size: 16px }` inside the ≤500px media query) is one line and beats
   editing 76 call sites — but it changes the visual size of fields on phones,
   so it is a design decision to confirm, not a silent fix. The alternative
   that preserves the type scale exactly is `maximum-scale=1, user-scalable=no`
   in the viewport meta, which we should **not** do: it's a WCAG 1.4.4
   violation and PRODUCT.md commits to AA.
2. Add `interactive-widget=resizes-content` to the viewport meta so Android
   Chrome resizes the layout viewport when the keyboard opens, which keeps
   fixed chrome above it for free.
3. For iOS, a small `useVisualViewport()` hook publishing
   `--pav-keyboard: <px>`; the chat composer offsets by it and the nav dock
   hides while the keyboard is up (it's dead weight mid-composition anyway).

### Phase 5 — Browser-first polish

- `theme-color` gets a `prefers-color-scheme` pair so the URL bar tint tracks
  the app rather than being pinned to mist.
- Drop `apple-mobile-web-app-status-bar-style: black-translucent` or pair it
  properly with the Phase 1 top inset — as it stands it is the reason
  standalone mode runs content under the clock.
- No install nagging. Given the 99% assumption, the manifest stays for the few
  who do install, but we add no A2HS interstitial; at most a quiet entry in
  settings.
- Verify the `NetworkFirst` navigation policy still behaves once the document
  scrolls (it should — nothing here touches the service worker).

### Phase 6 — Verify on real devices

Phases 0–5 are checked in CI against emulated devices, which do not emulate
toolbar collapse. A short manual pass on one physical iPhone (Safari + Chrome)
and one Android (Chrome) confirms the actual deliverable: scroll a tab, watch
the toolbar go away, and confirm nothing is clipped when it comes back.

---

## 3. Sequencing and effort

| Phase | Scope | Risk | Ships independently |
|---|---|---|---|
| 0 Harness | `playwright.config.ts`, 1 new spec | none | yes |
| 1 Tokens | `index.css`, 9 screen roots, NavDock, Sheet | low | yes |
| 2 Root scroller | new `ScreenScroll`, App, PhoneFrame, 29 sites | **high** | yes |
| 3 Overlays fixed | Sheet, Overlays, AppToast, ConfirmSheet | medium | needs 2 |
| 4 Keyboard | index.css, index.html, 1 hook, 3 chat screens | medium | yes |
| 5 Polish | index.html, manifest | low | yes |
| 6 Device pass | manual | none | — |

Phases 1, 4 and 5 are independently valuable and could ship before 2 if we
want space reclaimed and the zoom bug gone this week. Phase 2 is where the
toolbar actually disappears, and 3 must land in the same release as 2.

## 4. Open decisions

1. **16px inputs (Phase 4.1).** Fixes the zoom bug app-wide in one line, but
   visibly enlarges every field on phones. Accept the size change, or hand-tune
   per field? Recommendation: accept it — 13px form text is below what PRODUCT.md's
   large-type commitment implies anyway.
2. **Breakpoint.** 500px is the current line. Phones in landscape (up to 932px)
   currently get frame mode and would keep the non-collapsing toolbar. Extend
   page mode to `(hover: none) and (pointer: coarse)` instead of a pure width
   query?
3. **Standalone mode.** Page mode works there too (no toolbar to collapse, just
   a scrolling document), so I propose one mobile layout for both rather than
   maintaining two. Flagging it because it slightly changes installed-app feel:
   chrome is fixed-positioned rather than structurally pinned.
