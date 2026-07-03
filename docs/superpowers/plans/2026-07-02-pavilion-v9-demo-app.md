# Pavilion v9 Demo App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pixel-faithful, fully interactive rebuild of the Pavilion v9 prototype as a Vite + React + TypeScript SPA deployed on Vercel (spec: `docs/superpowers/specs/2026-07-02-pavilion-v9-app-design.md`).

**Architecture:** Client-state SPA. One Zustand store mirrors the prototype's state machine; typed seed-data modules are the only layer Supabase replaces in Phase 2; screens/sheets are ported 1:1 from the prototype HTML, whose source is the visual spec.

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind CSS 3, Zustand 4, @phosphor-icons/react, @fontsource (Young Serif, Nunito Sans), vite-plugin-pwa, Vitest + React Testing Library, Playwright.

## Global Constraints

- **Visual source of truth:** `project/Pavilion App v9.dc.html` (committed in this repo). Every screen task cites its line range; match colors, dimensions, radii, copy, and animations exactly. Do NOT copy the prototype's `sc-if`/`sc-for`/`{{ }}` internals — port to idiomatic React.
- **Palette (Tailwind theme names, use everywhere):** navy `#1A3352`, cream `#F5F0E6`, paper `#FFFEFA`, sand `#EDE6D6`, parchment `#F9F5EC`, ember `#E06A3E`, terracotta `#C75A31`, blush `#FBEDE4`, peach `#E8A788`, sage `#2A9D5C`, mint `#E9F6EE`, sagedark `#228049`, gold `#D9A441`, goldpale `#FBF3E0`, golddark `#A87B1F`, sky `#4A90E2`, skydeep `#3A73B5`, skypale `#EAF3FD`, ink `#3E4C63`, stone `#8A8375`, stonelight `#A39B8B`, bark `#5B554A`, taupe `#7A7365`, red `#C7402E`.
- **Fonts:** headings `font-serif` = 'Young Serif', serif (weight 400); body `font-sans` = 'Nunito Sans' (400/600/700/800).
- **Animations (CSS keyframes, exactly as prototype lines 22–30):** `scPop`, `scFadeUp`, `sheetUp`, `heartPop`, `typingBounce`, `orbGlow`, `confettiPop`; all wrapped in a `prefers-reduced-motion: reduce` kill switch.
- **Phone frame:** 393×830, radius 44px, `max-height: calc(100vh - 48px)`, on the radial cream gradient page background (prototype line 40). On viewports ≤ 500px wide render the app full-bleed without the frame or brief panel.
- **No server code, no env vars, no network calls.** Simulated actions always succeed.
- **Icons:** `@phosphor-icons/react`; prototype classes map as `ph-fill ph-bank` → `<Bank weight="fill" />`, `ph-bold ph-x` → `<X weight="bold" />`, plain `ph ph-heart` → `<Heart weight="regular" />`.
- Commit after every task with the message given in the task; all commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
- Run `npx tsc --noEmit` and `npx vitest run` before every commit; both must pass.

---

### Task 1: Scaffold, theme, fonts, keyframes

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `tailwind.config.ts`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/setupTests.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: Tailwind color names per Global Constraints; CSS classes `animate-scpop`, `animate-fadeup`, `animate-sheetup`, `animate-heartpop`, `animate-orbglow`; utility class `pav-scroll` (hidden scrollbars).

- [ ] **Step 1: Scaffold the project**

```powershell
npm create vite@latest . -- --template react-ts
npm install
npm install zustand @phosphor-icons/react
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vite-plugin-pwa
npm install @fontsource/young-serif @fontsource/nunito-sans
npx tailwindcss init -p --ts
```

- [ ] **Step 2: Configure Tailwind theme**

`tailwind.config.ts`:

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A3352', cream: '#F5F0E6', paper: '#FFFEFA', sand: '#EDE6D6',
        parchment: '#F9F5EC', ember: '#E06A3E', terracotta: '#C75A31',
        blush: '#FBEDE4', peach: '#E8A788', sage: '#2A9D5C', mint: '#E9F6EE',
        sagedark: '#228049', gold: '#D9A441', goldpale: '#FBF3E0',
        golddark: '#A87B1F', sky: '#4A90E2', skydeep: '#3A73B5',
        skypale: '#EAF3FD', ink: '#3E4C63', stone: '#8A8375',
        stonelight: '#A39B8B', bark: '#5B554A', taupe: '#7A7365', red: '#C7402E',
      },
      fontFamily: {
        serif: ["'Young Serif'", 'serif'],
        sans: ["'Nunito Sans'", 'system-ui', 'sans-serif'],
      },
      animation: {
        scpop: 'scPop 0.35s ease both',
        fadeup: 'scFadeUp 0.3s ease both',
        sheetup: 'sheetUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
        heartpop: 'heartPop 0.35s ease',
        orbglow: 'orbGlow 3.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Global CSS with keyframes**

`src/index.css` (keyframes copied verbatim from prototype lines 22–30):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Nunito Sans', system-ui, sans-serif; }
.pav-scroll::-webkit-scrollbar { display: none; }
.pav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
@keyframes scPop { 0% { transform: scale(0.985); } 100% { transform: scale(1); } }
@keyframes scFadeUp { from { transform: translateY(10px); } to { transform: translateY(0); } }
@keyframes sheetUp { from { transform: translateY(46px); } to { transform: translateY(0); } }
@keyframes heartPop { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
@keyframes typingBounce { 0%,60%,100% { transform: translateY(0); opacity: 0.35; } 30% { transform: translateY(-4px); opacity: 1; } }
@keyframes orbGlow { 0%,100% { box-shadow: 0 6px 18px -4px rgba(224,106,62,0.55); } 50% { box-shadow: 0 6px 26px -2px rgba(224,106,62,0.8); } }
@keyframes confettiPop { 0% { transform: translate(-50%,-50%) rotate(0deg); opacity: 1; } 100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; } }
```

`src/main.tsx` imports `@fontsource/young-serif/400.css` and `@fontsource/nunito-sans/{400,600,700,800}.css` before `./index.css`.

- [ ] **Step 4: Vitest config + failing smoke test**

Add to `vite.config.ts`: `test: { environment: 'jsdom', setupFiles: './src/setupTests.ts', globals: true }` (with `/// <reference types="vitest" />`). `src/setupTests.ts`: `import '@testing-library/jest-dom';`

`src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders the Pavilion shell', () => {
  render(<App />);
  expect(screen.getByTestId('phone-frame')).toBeInTheDocument();
});
```

Run: `npx vitest run` — expected: FAIL (no `phone-frame`).

- [ ] **Step 5: Minimal App shell to pass**

`src/App.tsx`:

```tsx
export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center gap-11 flex-wrap p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #F2EBDC 0%, #EBE3D0 60%, #E5DCC6 100%)' }}>
      <div data-testid="phone-frame"
        className="relative w-[393px] h-[830px] max-h-[calc(100vh-48px)] rounded-[44px] overflow-hidden bg-cream shrink-0"
        style={{ boxShadow: '0 40px 90px -30px rgba(50,42,26,0.5), 0 0 0 1px rgba(26,51,82,0.05)' }} />
    </div>
  );
}
```

Run: `npx vitest run` — expected: PASS. Run `npm run build` — expected: success.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite+React+TS app with Pavilion theme and keyframes"
```

---

### Task 2: Seed data layer

**Files:**
- Create: `src/data/types.ts`, `src/data/amenities.ts`, `src/data/searchIndex.ts`, `src/data/vendors.ts`, `src/data/directory.ts`, `src/data/freeTable.ts`, `src/data/mapPins.ts`, `src/data/portfolio.ts`, `src/data/aging.ts`, `src/data/circles.ts`, `src/data/notifications.ts`, `src/data/chats.ts`, `src/data/documents.ts`, `src/data/pennyQA.ts`, `src/data/index.ts`
- Test: `src/data/data.test.ts`

**Interfaces:**
- Produces: named exports `AMENS, SEARCH, VENDORS, DIR, FREE, PINS, MAP_LAYERS, PORTFOLIO, AGING, CIRC, ONBOARD_CIRCLES, HH, ARC_TYPES, NOTIFS, NOTIF_CATS, CHAT_SEED, DOCS, DOC_SECTIONS, QA, SLOTS, DAYS` re-exported from `src/data/index.ts`, each typed in `src/data/types.ts`.

- [ ] **Step 1: Write failing test**

`src/data/data.test.ts`:

```ts
import { AMENS, SEARCH, PORTFOLIO, QA, NOTIFS, CHAT_SEED, PINS, AGING, DOCS } from './index';

it('seed data matches the prototype dataset', () => {
  expect(AMENS).toHaveLength(4);
  expect(AMENS[0].name).toBe('Pool Cabana');
  expect(AMENS[0].taken).toEqual([0, 3]);
  expect(SEARCH).toHaveLength(10);
  expect(PORTFOLIO.map(p => p.doors)).toEqual([136, 48, 30]);
  expect(Object.keys(QA)).toEqual(['fence', 'pool', 'rent']);
  expect(NOTIFS).toHaveLength(6);
  expect(Object.keys(CHAT_SEED)).toEqual(['tom', 'rosa', 'priya', 'okafor']);
  expect(PINS).toHaveLength(6);
  expect(AGING).toHaveLength(5);
  expect(DOCS).toHaveLength(5);
});
```

Run: `npx vitest run src/data` — expected: FAIL (module not found).

- [ ] **Step 2: Transcribe the datasets**

Transcribe every constant **verbatim** from the prototype script, prototype lines 2718–2841 (`AMENS` 2719, `SEARCH` 2725, `VENDORS` 2738, `SLOTS`/`DAYS` 2744–2745, `ARC_TYPES` 2747, `HH` 2749, `CIRCLES`→`ONBOARD_CIRCLES` 2756, `QA` 2765, `DIR` 2771, `FREE` 2778, `PINS` 2785, `MAP_LAYERS` 2794, `PORTFOLIO` 2796, `AGING` 2802, `CIRC` 2810, `NOTIFS` 2817, `NOTIF_CATS` 2826, `CHAT_SEED` 2828, `DOCS` 2835) plus `DOC_SECTIONS` from line 3170. Icon-class strings stay as strings in data (e.g. `'ph-fill ph-swimming-pool'`); a shared `<PhIcon name="..."/>` helper (Task 4) renders them. Define one interface per dataset in `types.ts` (e.g. `Amenity { name, sub, icon, avail, taken: number[], occ, occColor, rules }`).

- [ ] **Step 3: Run test to verify pass**

Run: `npx vitest run src/data` — expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/data
git commit -m "feat: add typed Juniper Ridge seed data layer"
```

---

### Task 3: Zustand store + derived selectors

**Files:**
- Create: `src/store/store.ts`, `src/store/selectors.ts`
- Test: `src/store/store.test.ts`

**Interfaces:**
- Consumes: `AMENS`, `SLOTS`, `DAYS`, `NOTIFS`, `PORTFOLIO` from `src/data`.
- Produces: `usePavStore` hook. State + actions mirror the prototype state object (lines 2592–2716) 1:1 — same keys: `tab, role, voted, arcSeen, rsvpFood, rsvpMovie, liked, offered, waved, filter, amenIdx, slotIdx, booked, bookingSummary, dayIdx, durIdx, waitlisted, pennyOpen, typing, pennyInput, msgs, paySheetOpen, paid, autopay, planActive, apPaused, arcSheetOpen, arcType, arcDesc, arcSubmitted, arcApprovedByBoard, boardMode, boardTab, reportTicketed, gateScheduled, reminderSent, bcText, broadcastSent, m89Assigned, courtesySent, invApproved, minutesPublished, obOpen, obStep, hh, circles, obAutopay, myPlaceOpen, mapOpen, mapLayer, selPin, commonsView, nudgeDismissed, claimed, dirWaved, circJoined, largeType, notifOpen, notifsRead, mutedCats, chatWith, chats, chatInput, msgsOpen, docsOpen, docReader, docQ, diffOpen, circleOpen, rsvpGarden, eventsOpen, rsvpPool, volPopcorn, meetingOpen, handRaised, proxyOpen, proxyPick, reportOpen, reportType, reportDesc, reportSubmitted, passOpen, passName, passPlate, passDur, passIssued, loginOpen, commentsOpen, comments, commentInput, alertDismissed, searchOpen, searchQ, violSheetOpen, violFixed, calAdded, voteDraftOpen, voteQ, voteOptA, voteOptB, votePosted, memberAdded, portfolioOpen, saSheetOpen, saPaid, saPlan, tenantRegistered, exportOpen, exportDone, activeCommunity` — plus **scenario flags** (prototype props → store fields): `showDelinquent, showSpecialAssessment, showViolation, showAlert` (defaults false/false/true/false) and `set(patch)` generic action.
- Produces (selectors.ts): `useQuorum() → { count, pct }` (87 + voted?1 + reminderSent?6, pct = round(count/136*100)); `useAttention() → { n, summary }` (owner tasks: unpaid + arc unseen, vote task for owner|manager — copy logic from lines 2926–2931); `useTally() → { yesC, noC, yesPct }` (61/26 base, lines 3117–3119); `useTriage() → { left, summary }` (lines 3025–3026); `useBoardOpenCount()` (line 3103); `useDelinquent()` (`showDelinquent && !paid && !planActive`); `sendPennyMessage(text)`, `askPennyChip(key)`, `askPennyDocsSummary()` actions reproducing the scripted flows at lines 2850–2893 (1000–1400ms `setTimeout`, typing flag); `sendChatMessage()` reproducing lines 2874–2883.

- [ ] **Step 1: Write failing tests**

`src/store/store.test.ts`:

```ts
import { act } from '@testing-library/react';
import { usePavStore, initialState } from './store';
import { getQuorum, getAttention, getTriage, getTally } from './selectors';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));
const s = () => usePavStore.getState();

it('vote increments quorum and records ballot', () => {
  expect(getQuorum(s()).count).toBe(87);
  act(() => s().set({ voted: 'yes' }));
  expect(getQuorum(s()).count).toBe(88);
  expect(getTally(s()).yesC).toBe(62);
});

it('booking builds summary from amenity, day, slot, duration', () => {
  act(() => s().set({ amenIdx: 0, dayIdx: 2, slotIdx: 4, durIdx: 1 }));
  act(() => s().book());
  expect(s().bookingSummary).toBe('Pool Cabana · Thu, 4–6 PM · 2 hr');
  expect(s().booked).toBe(true);
});

it('ARC flow: submit appears for board, approve flips status', () => {
  act(() => s().set({ arcType: 'Paint' }));
  act(() => s().submitArc());
  expect(s().arcSubmitted).toBe(true);
  expect(getTriage(s()).left).toBe(3); // streetlight + gate + new ARC
  act(() => s().set({ arcApprovedByBoard: true }));
  expect(getTriage(s()).left).toBe(2);
});

it('attention summary reacts to role', () => {
  expect(getAttention(s()).n).toBe(3); // owner: vote + pay + arc
  act(() => s().set({ role: 'tenant' }));
  expect(getAttention(s()).n).toBe(0);
});

it('delinquent scenario computes from flags', () => {
  act(() => s().set({ showDelinquent: true }));
  expect(getQuorum(s()).count).toBe(87);
  expect(s().paid).toBe(false);
});
```

Run: `npx vitest run src/store` — expected: FAIL.

- [ ] **Step 2: Implement store**

`src/store/store.ts`: `create<PavState>()(...)` with `initialState` exported separately (all defaults from prototype lines 2592–2716; `role: 'owner'`, `tab: 'today'`). Actions: generic `set(patch: Partial<PavState>)`, plus multi-step actions `book()` (guard `slotIdx != null`, compose summary `AMENS[amenIdx].name + ' · ' + DAYS[dayIdx].split(' · ')[0] + ', ' + SLOTS[slotIdx] + ' · ' + ['1 hr','2 hr'][durIdx]`), `cancelBooking()`, `submitArc()` (guard `arcType`), `submitReport()`, `issuePass()` (guard name+plate), `sendBroadcast()`, `postVote()`, `sendPennyMessage`, `askPennyChip`, `askPennyDocsSummary`, `sendChatMessage`, `pickRole(role)` (resets `boardMode/myPlaceOpen/portfolioOpen`, `tab:'today'` — line 3689). Selectors in `selectors.ts` as pure functions `getX(state)` plus hook wrappers `useX()`.

- [ ] **Step 3: Run tests to verify pass**

Run: `npx vitest run src/store` — expected: PASS (5 tests).

- [ ] **Step 4: Commit**

```bash
git add src/store
git commit -m "feat: add Zustand store mirroring prototype state machine"
```

---

### Task 4: Shared primitives

**Files:**
- Create: `src/components/PhIcon.tsx`, `src/components/Sheet.tsx`, `src/components/Chip.tsx`, `src/components/SegmentedControl.tsx`, `src/components/Toggle.tsx`, `src/components/ProgressBar.tsx`, `src/components/StatusTimeline.tsx`, `src/components/Confetti.tsx`, `src/components/TypingDots.tsx`, `src/components/Avatar.tsx`, `src/components/Pill.tsx`, `src/components/PhotoPlaceholder.tsx`
- Test: `src/components/components.test.tsx`

**Interfaces:**
- Produces:
  - `PhIcon({ name: string; size?: number; color?: string; className?: string })` — parses `'ph-fill ph-swimming-pool'` style strings, maps kebab-case to the `@phosphor-icons/react` component, weight from prefix (`ph-fill`→fill, `ph-bold`→bold, `ph`→regular).
  - `Sheet({ open, onClose, children, maxHeight? })` — dark scrim (`rgba(26,30,20,0.4)`, closes on click), bottom panel `bg-parchment rounded-t-[28px] animate-sheetup` with the 40×4 drag handle (prototype pay-sheet lines 1282–1285).
  - `Chip({ label, active, onClick, icon? })` — pill button, active = navy bg/cream text, inactive = paper bg/bark text with `1px solid rgba(26,51,82,0.12)` border.
  - `SegmentedControl({ options: {key,label}[], value, onChange, variant?: 'light'|'dark' })` — sand track, active segment paper(+shadow) or navy per variant (Commons line 285 vs Board line 855).
  - `Toggle({ on, onToggle, size?: 'sm'|'lg' })` — 46×27 (sm) / 52×30 (lg), sage when on (lines 1319–1321).
  - `ProgressBar({ pct: number, color?: string, track?: string, height?: number, gradient?: boolean })` — rounded, animated width `transition: width 0.6s cubic-bezier(0.22,1,0.36,1)`; gradient variant `linear-gradient(90deg,#E06A3E,#F97B4B)`.
  - `StatusTimeline({ steps: { label: string; state: 'done'|'active'|'pending'; icon?: string }[] })` — dots + connecting segments (ARC card lines 746–752; colors done `#2A9D5C`, active `#D9A441`, pending `#D9CFB8`).
  - `Confetti()` — the 6 absolutely-positioned confetti spans with `--tx/--ty/--rot` vars copied from line 193.
  - `TypingDots()` — three bouncing dots (lines 1429–1433).
  - `Avatar({ initial, color, size? })`, `Pill({ label, bg, color })`, `PhotoPlaceholder({ label, height, tint? })` (striped `repeating-linear-gradient` block with mono caption, line 322).

- [ ] **Step 1: Write failing tests**

`src/components/components.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PhIcon } from './PhIcon';
import { Sheet } from './Sheet';
import { StatusTimeline } from './StatusTimeline';
import { Toggle } from './Toggle';

it('PhIcon maps prototype class strings to phosphor components', () => {
  const { container } = render(<PhIcon name="ph-fill ph-swimming-pool" size={20} />);
  expect(container.querySelector('svg')).toBeInTheDocument();
});

it('Sheet renders children when open and closes on scrim click', () => {
  const onClose = vi.fn();
  render(<Sheet open onClose={onClose}><p>Pay dues</p></Sheet>);
  expect(screen.getByText('Pay dues')).toBeInTheDocument();
  fireEvent.click(screen.getByTestId('sheet-scrim'));
  expect(onClose).toHaveBeenCalled();
});

it('StatusTimeline renders one node per step', () => {
  render(<StatusTimeline steps={[
    { label: 'Submitted', state: 'done' },
    { label: 'Board review', state: 'active' },
    { label: 'Decision', state: 'pending' },
  ]} />);
  expect(screen.getByText('Board review')).toBeInTheDocument();
});

it('Toggle reflects state and fires', () => {
  const fn = vi.fn();
  render(<Toggle on={false} onToggle={fn} />);
  fireEvent.click(screen.getByRole('switch'));
  expect(fn).toHaveBeenCalled();
});
```

Run: `npx vitest run src/components` — expected: FAIL.

- [ ] **Step 2: Implement the primitives** per the Interfaces block, styling verbatim from the cited prototype lines.

- [ ] **Step 3: Run tests to verify pass** — `npx vitest run src/components` — expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components
git commit -m "feat: add shared UI primitives (Sheet, PhIcon, timeline, toggles)"
```

---

### Task 5: App shell — phone frame, nav dock, tab routing, brief/demo panel

**Files:**
- Create: `src/components/PhoneFrame.tsx`, `src/components/NavDock.tsx`, `src/components/StatusBar.tsx`, `src/components/BriefPanel.tsx`, `src/components/ErrorBoundary.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx` (extend)

**Interfaces:**
- Consumes: `usePavStore` (`tab`, `role`, scenario flags, `pickRole`, overlay flags).
- Produces: `App` renders `BriefPanel` (desktop only) + `PhoneFrame`; inside the frame: `StatusBar` (9:41 + signal icons, lines 72–80), the active screen by `tab`, all overlay screens/sheets (added by later tasks via a central `<Overlays/>` component stub), and `NavDock`. `NavDock` = 5-column navy dock, Penny orb center button translateY(-16px) with `animate-orbglow` (lines 2537–2562); active tab cream, inactive `rgba(245,240,230,0.45)`. `BriefPanel` = the left design-brief column (lines 44–66) reworded as demo controls: role chips (Owner/Tenant/Manager → `pickRole`), scenario toggles (Special assessment, Delinquent, Violation, Alert), buttons "Preview new-resident onboarding" (`set({obOpen:true, obStep:0})`) and "Preview sign-in screen" (`set({loginOpen:true})`).

- [ ] **Step 1: Write failing tests**

Append to `src/App.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { act } from 'react';
import App from './App';
import { usePavStore, initialState } from './store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('nav dock switches tabs', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /commons/i }));
  expect(usePavStore.getState().tab).toBe('commons');
});

it('role chips switch role and reset to today', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: /tenant/i }));
  expect(usePavStore.getState().role).toBe('tenant');
});
```

Run: `npx vitest run src/App.test.tsx` — expected: FAIL.

- [ ] **Step 2: Implement** shell per Interfaces. Screens not yet built render a temporary `<div data-screen-label="X" />` placeholder inside the frame (replaced by Tasks 6–15). Wrap frame contents in `ErrorBoundary` (friendly cream reset card with a "Restart demo" button that calls `usePavStore.setState(initialState, true)`).

- [ ] **Step 3: Run tests to verify pass** — `npx vitest run` — expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: app shell with phone frame, nav dock, and demo controls panel"
```

---

### Task 6: Today screen

**Files:**
- Create: `src/screens/Today.tsx`
- Modify: `src/App.tsx` (mount for `tab === 'today'`)
- Test: `src/screens/Today.test.tsx`

**Interfaces:**
- Consumes: store + `getAttention`, `getQuorum`; `Confetti`, `PhIcon`, `Avatar`.
- Produces: Today screen ported from prototype **lines 82–277**: alert banner (if `showAlert && !alertDismissed`), date/greeting header with search/bell(badge)/avatar buttons, attention summary, needs-you card stack (manager portfolio card, tenant rent card, SA card, vote card, pay card, ARC card, violation pending/fixed cards, all-clear confetti card — visibility rules exactly as lines 3694–3720 role gating), Penny nudge, Around-the-neighborhood section (taco RSVP, booking/cabana card, map teaser, Okafors wave).

- [ ] **Step 1: Write failing tests**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import { Today } from './Today';
import { usePavStore, initialState } from '../store/store';

beforeEach(() => act(() => usePavStore.setState(initialState, true)));

it('owner sees vote, pay and ARC cards', () => {
  render(<Today />);
  expect(screen.getByText(/pool furniture vote closes thursday/i)).toBeInTheDocument();
  expect(screen.getByText(/july dues are ready/i)).toBeInTheDocument();
  expect(screen.getByText(/your pergola was approved/i)).toBeInTheDocument();
});

it('tenant sees rent-goes-to-landlord card, no pay card', () => {
  act(() => usePavStore.getState().set({ role: 'tenant' }));
  render(<Today />);
  expect(screen.getByText(/rent goes to your landlord/i)).toBeInTheDocument();
  expect(screen.queryByText(/july dues are ready/i)).not.toBeInTheDocument();
});

it('wave button flips to sent state', () => {
  render(<Today />);
  fireEvent.click(screen.getByRole('button', { name: /wave/i }));
  expect(screen.getByText(/wave sent/i)).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** by porting lines 82–277 to JSX/Tailwind. Screen container: `absolute inset-0 overflow-y-auto pav-scroll animate-scpop` with padding `64px 18px 150px`.

- [ ] **Step 3: Run tests to verify pass**, plus `npx tsc --noEmit`.

- [ ] **Step 4: Commit** — `git commit -m "feat: Today screen with role-gated needs-you cards"`

---

### Task 7: Commons screen (feed, circles, people, free)

**Files:**
- Create: `src/screens/Commons.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/Commons.test.tsx`

**Interfaces:**
- Consumes: store (`commonsView`, `filter`, `liked`, `comments`, `claimed`, `dirWaved`, `circJoined`, `offered`, `rsvpMovie`), `DIR`, `FREE`, `CIRC`; `SegmentedControl`, `PhotoPlaceholder`, `Avatar`.
- Produces: Commons ported from prototype **lines 279–521**: 4-segment control (Feed/Circles/People/Free); feed = composer stub, private-report link (`set({reportOpen:true})`), filter chips, Maria shoutout post (like heart pop, expandable comments with input), Dev ladder post (offer button), movie event card (RSVP), Garden Circle post; Circles hub (Yours + Discover with join toggles + start-a-circle); People directory (messages entry `set({msgsOpen:true})`, opt-in note, wave/message per card); Free table 2-col grid with claim buttons.

- [ ] **Step 1: Write failing tests**

```tsx
it('like toggles heart count', () => {
  render(<Commons />);
  const like = screen.getByRole('button', { name: /14/ });
  fireEvent.click(like);
  expect(screen.getByText('15')).toBeInTheDocument();
});

it('comment can be added', () => {
  render(<Commons />);
  fireEvent.click(screen.getByRole('button', { name: /2/ })); // open comments
  fireEvent.change(screen.getByPlaceholderText(/add a comment/i), { target: { value: 'Way to go Tom' } });
  fireEvent.keyDown(screen.getByPlaceholderText(/add a comment/i), { key: 'Enter' });
  expect(screen.getByText('Way to go Tom')).toBeInTheDocument();
});

it('free table claim flips button state', () => {
  render(<Commons />);
  fireEvent.click(screen.getByRole('button', { name: /^free$/i }));
  fireEvent.click(screen.getAllByRole('button', { name: /^claim$/i })[0]);
  expect(screen.getByText(/claimed ✓/i)).toBeInTheDocument();
});
```

(Same render/beforeEach harness as Task 6.) Run — expected: FAIL.

- [ ] **Step 2: Implement** port of lines 279–521.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: Commons screen with feed, circles, directory, free table"`

---

### Task 8: Reserve screen + Guest pass sheet

**Files:**
- Create: `src/screens/Reserve.tsx`, `src/sheets/PassSheet.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/Reserve.test.tsx`

**Interfaces:**
- Consumes: store (`amenIdx`, `dayIdx`, `slotIdx`, `durIdx`, `waitlisted`, `booked`, `bookingSummary`, `calAdded`, `passOpen`, `passName`, `passPlate`, `passDur`, `passIssued`, `book`, `cancelBooking`, `issuePass`), `AMENS`, `SLOTS`, `DAYS`; `Sheet`, `Chip`.
- Produces: Reserve list + detail ported from **lines 523–628** (list: guest-pass banner, active-booking card, amenity cards with occupancy dot; detail: back link, rules card, day chips, slot grid with taken/waitlist states, duration chips, disabled-until-slot book CTA, booked confirmation with add-to-calendar) and PassSheet from **lines 2268–2313** (name/plate inputs, duration chips, QR-style pass card `JR-0142`, text-to-guest + done).

- [ ] **Step 1: Write failing tests**

```tsx
it('booking flow: pick slot, book, see confirmation', () => {
  render(<Reserve />);
  fireEvent.click(screen.getByText('Pool Cabana'));
  fireEvent.click(screen.getByRole('button', { name: '4–6 PM' }));
  fireEvent.click(screen.getByRole('button', { name: /book 4–6 pm/i }));
  expect(screen.getByText('Booked!')).toBeInTheDocument();
  expect(screen.getByText(/pool cabana · today, 4–6 pm · 2 hr/i)).toBeInTheDocument();
});

it('taken slot joins waitlist instead of selecting', () => {
  render(<Reserve />);
  fireEvent.click(screen.getByText('Pool Cabana'));
  fireEvent.click(screen.getByRole('button', { name: /8–10 am · taken/i }));
  expect(screen.getByRole('button', { name: /8–10 am · on waitlist/i })).toBeInTheDocument();
});

it('guest pass requires name and plate, then issues', () => {
  render(<><Reserve /><PassSheet /></>);
  fireEvent.click(screen.getByText(/expecting visitors/i));
  fireEvent.change(screen.getByPlaceholderText(/guest name/i), { target: { value: 'Jordan' } });
  fireEvent.change(screen.getByPlaceholderText(/license plate/i), { target: { value: '7ABC123' } });
  fireEvent.click(screen.getByRole('button', { name: /issue pass/i }));
  expect(screen.getByText(/pass jr-0142/i)).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** ports.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: Reserve booking flow and guest pass sheet"`

---

### Task 9: HOA screen

**Files:**
- Create: `src/screens/Hoa.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/Hoa.test.tsx`

**Interfaces:**
- Consumes: store (`voted`, `arcSubmitted`, `arcApprovedByBoard`, `reportTicketed`, `gateScheduled`), `getQuorum`, `getTally`; `ProgressBar`, `StatusTimeline`, `Confetti`.
- Produces: HOA ported from **lines 630–828**: open-vote navy card (Yes/No buttons → confetti receipt `#R-0482` + live YES/NO tally bars), annual-meeting row (`set({meetingOpen:true})`), "Your $285, itemized" stacked bar + legend + reserve-fund bar + funding-forecast mini chart (verbatim from lines 688–731), ARC section (+ New request → `set({arcSheetOpen:true})`, dynamic #A-121 card, static approved #A-118 card), Known issues (status pills react to board actions, lines 3637–3642), Decisions log, Documents + Ask Penny tiles.

- [ ] **Step 1: Write failing tests**

```tsx
it('voting yes shows receipt and tally', () => {
  render(<Hoa />);
  fireEvent.click(screen.getByRole('button', { name: /yes, replace it/i }));
  expect(screen.getByText(/ballot receipt #r-0482/i)).toBeInTheDocument();
  expect(screen.getByText(/62 · 70%/)).toBeInTheDocument();
});

it('known issues reflect board progress', () => {
  act(() => usePavStore.getState().set({ gateScheduled: true }));
  render(<Hoa />);
  expect(screen.getByText(/aquafix · thu jul 3/i)).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** port of lines 630–828.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: HOA screen with live vote, dues breakdown, ARC and decisions"`

---

### Task 10: Money sheets — Pay + Special Assessment

**Files:**
- Create: `src/sheets/PaySheet.tsx`, `src/sheets/SASheet.tsx`
- Modify: `src/App.tsx`
- Test: `src/sheets/money.test.tsx`

**Interfaces:**
- Consumes: store (`paySheetOpen`, `paid`, `planActive`, `autopay`, `saSheetOpen`, `saPaid`, `saPlan`, `showDelinquent`, `showSpecialAssessment`), `getDelinquent`; `Sheet`, `Toggle`, `Confetti`.
- Produces: PaySheet from **lines 1280–1356** (normal $285 vs delinquent $570 + past-due notice + 3×$190 plan option; itemized stacked bar; bank row; autopay toggle; paid state with confetti + receipt `#P-2231`; plan-confirm state) and SASheet from **lines 2405–2445** ($450 share card, due-Aug-1 note, pay / 3×$150 plan, paid receipt `#S-118`).

- [ ] **Step 1: Write failing tests**

```tsx
it('pays july dues and shows receipt', () => {
  act(() => usePavStore.getState().set({ paySheetOpen: true }));
  render(<PaySheet />);
  fireEvent.click(screen.getByRole('button', { name: /pay \$285\.00/i }));
  expect(screen.getByText(/receipt #p-2231/i)).toBeInTheDocument();
});

it('delinquent scenario offers 3-payment plan', () => {
  act(() => usePavStore.getState().set({ showDelinquent: true, paySheetOpen: true }));
  render(<PaySheet />);
  expect(screen.getByText(/june \+ july assessments/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /split into 3 payments of \$190/i }));
  expect(screen.getByText(/payment plan is set/i)).toBeInTheDocument();
});

it('special assessment can be paid in full', () => {
  act(() => usePavStore.getState().set({ saSheetOpen: true }));
  render(<SASheet />);
  fireEvent.click(screen.getByRole('button', { name: /pay \$450\.00/i }));
  expect(screen.getByText(/receipt #s-118/i)).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** both sheets.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: pay and special-assessment sheets with plans and receipts"`

---

### Task 11: Request sheets — ARC, Report, Violation

**Files:**
- Create: `src/sheets/ArcSheet.tsx`, `src/sheets/ReportSheet.tsx`, `src/sheets/ViolSheet.tsx`
- Modify: `src/App.tsx`
- Test: `src/sheets/requests.test.tsx`

**Interfaces:**
- Consumes: store (`arcSheetOpen`, `arcType`, `arcDesc`, `submitArc`, `reportOpen`, `reportType`, `reportDesc`, `submitReport`, `violSheetOpen`, `violFixed`), `ARC_TYPES`; `Sheet`, `Chip`, `StatusTimeline`, `PhotoPlaceholder`.
- Produces: ArcSheet from **lines 1358–1397** (type chips, description, photo placeholders, Penny fast-track tip, disabled-until-type submit), ReportSheet from **lines 2223–2266** (category chips, description, photo, sent-privately confirmation with Submitted→Triage→Fixed timeline, ticket `#M-89`), ViolSheet from **lines 2315–2357** (courtesy notice `#V-31`, CC&R §6.3 citation chip, Noticed→Fix→Closes timeline, Penny reassurance, "I've taken care of it" → thanks state, message-board escape hatch → opens ReportSheet with type `Violation concern`).

- [ ] **Step 1: Write failing tests**

```tsx
it('ARC submit is gated on project type', () => {
  act(() => usePavStore.getState().set({ arcSheetOpen: true }));
  render(<ArcSheet />);
  expect(screen.getByRole('button', { name: /pick a project type/i })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^paint$/i }));
  fireEvent.click(screen.getByRole('button', { name: /submit to the board/i }));
  expect(usePavStore.getState().arcSubmitted).toBe(true);
});

it('report submits privately with ticket number', () => {
  act(() => usePavStore.getState().set({ reportOpen: true }));
  render(<ReportSheet />);
  fireEvent.click(screen.getByRole('button', { name: /maintenance/i }));
  fireEvent.click(screen.getByRole('button', { name: /send privately to the board/i }));
  expect(screen.getByText(/ticket #m-89/i)).toBeInTheDocument();
});

it('violation can be marked fixed', () => {
  act(() => usePavStore.getState().set({ violSheetOpen: true }));
  render(<ViolSheet />);
  fireEvent.click(screen.getByRole('button', { name: /i've taken care of it/i }));
  expect(screen.getByText(/marked fixed/i)).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** all three sheets.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: ARC, private report, and violation notice sheets"`

---

### Task 12: Penny sheet (scripted assistant)

**Files:**
- Create: `src/sheets/PennySheet.tsx`
- Modify: `src/App.tsx`
- Test: `src/sheets/PennySheet.test.tsx`

**Interfaces:**
- Consumes: store (`pennyOpen`, `msgs`, `typing`, `pennyInput`, `askPennyChip`, `sendPennyMessage`), `QA`; `TypingDots`.
- Produces: PennySheet from **lines 1399–1449**: 78%-height sheet, gradient-orb header ("Answers cite Juniper Ridge's actual documents"), message list (auto-scroll to bottom on update via `useEffect` + ref), citation chips (tap → close Penny, open Documents reader), "Pass this to the board" button on fallback answers (→ ReportSheet, type `Other`), three QA suggestion chips, input row. Scripted timing: chip answer after 1100ms typing; free-typed → fallback after 1000ms (store actions from Task 3).

- [ ] **Step 1: Write failing tests**

```tsx
it('QA chip plays scripted answer with citation', async () => {
  act(() => usePavStore.getState().set({ pennyOpen: true }));
  render(<PennySheet />);
  fireEvent.click(screen.getByRole('button', { name: /can i paint my fence black/i }));
  expect(await screen.findByText(/short answer: not black/i, {}, { timeout: 2000 })).toBeInTheDocument();
  expect(screen.getByText(/cc&rs §4\.2/i)).toBeInTheDocument();
});

it('free-typed question gets the honest fallback with escalation', async () => {
  act(() => usePavStore.getState().set({ pennyOpen: true }));
  render(<PennySheet />);
  fireEvent.change(screen.getByPlaceholderText(/ask about rules/i), { target: { value: 'Can I build a moat?' } });
  fireEvent.keyDown(screen.getByPlaceholderText(/ask about rules/i), { key: 'Enter' });
  expect(await screen.findByText(/i won't guess/i, {}, { timeout: 2000 })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /pass this to the board/i })).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** the sheet.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: Penny scripted assistant sheet with citations and escalation"`

---

### Task 13: My Place + secondary screens (Map, Notifications, Messages, Chat, Documents, Circle, Events, Meeting, Search)

**Files:**
- Create: `src/screens/MyPlace.tsx`, `src/screens/MapScreen.tsx`, `src/screens/Notifications.tsx`, `src/screens/Messages.tsx`, `src/screens/Chat.tsx`, `src/screens/Documents.tsx`, `src/screens/CircleDetail.tsx`, `src/screens/Events.tsx`, `src/screens/Meeting.tsx`, `src/screens/Search.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/secondary.test.tsx`

**Interfaces:**
- Consumes: store + `NOTIFS`, `NOTIF_CATS`, `CHAT_SEED`, `DOCS`, `DOC_SECTIONS`, `SEARCH`, `PINS`, `MAP_LAYERS`; all primitives.
- Produces, each ported from its prototype range:
  - `MyPlace` **1551–1769**: role-specific header/stats (lines 3691–3693), board-desk entry (owner), portfolio entry (manager), tenant lease + registration cards, household (add member), vehicles & pets, my requests (dynamic ARC/report rows), payments history + autopay pause (owner), circles, settings (large type toggle, sign out).
  - `MapScreen` **1771–1832**: layer chips filter `PINS`, stylized map blocks, pin buttons, selected-pin action card (`doPinAction` routing incl. wave, line 3415).
  - `Notifications` **1834–1900**: Today/Earlier groups honoring `mutedCats` + `notifsRead`, mark-all-read, mute chips, all-muted empty state; row tap routes via `go` and closes.
  - `Messages` **1902–1924** + `Chat` **1926–1953**: inbox from `CHAT_SEED` + latest local message preview; chat thread with seeded first message, send → canned reply after 1200ms.
  - `Documents` **1955–2041**: doc list (only CC&Rs opens reader), reader with in-doc search filtering `DOC_SECTIONS`, §4 diff toggle, "Ask Penny to summarize" → Penny doc-summary flow.
  - `CircleDetail` **2043–2086**, `Events` **2088–2157** (July calendar cells from line 3190–3194, RSVPs, popcorn volunteer), `Meeting` **2159–2221** (quorum bar, agenda, raise hand → queue position, proxy assign/revoke).
  - `Search` **2359–2403**: idle chips, live filtering of `SEARCH` (title+sub+k substring match, line 2919), empty state → "Ask Penny instead".

- [ ] **Step 1: Write failing tests**

```tsx
it('search filters the index', () => {
  act(() => usePavStore.getState().set({ searchOpen: true }));
  render(<Search />);
  fireEvent.change(screen.getByPlaceholderText(/docs, decisions, people/i), { target: { value: 'ladder' } });
  expect(screen.getByText(/tom b\. · #18/i)).toBeInTheDocument();
});

it('muting a category hides its notifications', () => {
  act(() => usePavStore.getState().set({ notifOpen: true }));
  render(<Notifications />);
  expect(screen.getByText(/pool furniture vote closes thursday/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /^hoa$/i }));
  expect(screen.queryByText(/pool furniture vote closes thursday/i)).not.toBeInTheDocument();
});

it('chat sends and receives canned reply', async () => {
  act(() => usePavStore.getState().set({ chatWith: 'tom' }));
  render(<Chat />);
  fireEvent.change(screen.getByPlaceholderText(/message…/i), { target: { value: 'Thanks Tom!' } });
  fireEvent.keyDown(screen.getByPlaceholderText(/message…/i), { key: 'Enter' });
  expect(screen.getByText('Thanks Tom!')).toBeInTheDocument();
  expect(await screen.findByText(/see you around the ridge/i, {}, { timeout: 2500 })).toBeInTheDocument();
});

it('doc search filters sections and diff toggles', () => {
  act(() => usePavStore.getState().set({ docsOpen: true, docReader: true }));
  render(<Documents />);
  fireEvent.change(screen.getByPlaceholderText(/search within this document/i), { target: { value: 'quiet' } });
  expect(screen.getByText(/§5 · living/i)).toBeInTheDocument();
  expect(screen.queryByText(/§7 · leasing/i)).not.toBeInTheDocument();
});

it('meeting hand-raise joins queue and proxy can be assigned', () => {
  act(() => usePavStore.getState().set({ meetingOpen: true }));
  render(<Meeting />);
  fireEvent.click(screen.getByRole('button', { name: /raise your hand/i }));
  expect(screen.getByText(/#3 in the comment queue/i)).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** all screens from their cited ranges.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: My Place and secondary screens (map, notifs, chat, docs, events, meeting, search)"`

---

### Task 14: Board desk + Export sheet + Manager portfolio

**Files:**
- Create: `src/screens/BoardDesk.tsx`, `src/screens/Portfolio.tsx`, `src/sheets/ExportSheet.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/board.test.tsx`

**Interfaces:**
- Consumes: store, `getTriage`, `getBoardOpenCount`, `getQuorum`, `VENDORS`, `AGING`, `PORTFOLIO`; `SegmentedControl`, `ProgressBar`, `Sheet`.
- Produces:
  - `BoardDesk` from **lines 830–1278**: TREASURER header + exit to resident view; Open/Quorum/Collected stat tiles; Desk/Requests/Money/Comms segments. Desk: triage cards (streetlight create-ticket, dynamic #M-89 assign-vendor, dynamic ARC approve/needs-info, gate schedule) + vote monitor with nudge (quorum +6). Requests: ARC queue, maintenance list, violations courtesy card, vendor COI list. Money: collections bar, late list + courtesy reminders, budget-vs-actual bars, SA progress (if `showSpecialAssessment`), aging report + export button, invoice co-sign. Comms: broadcast composer (disabled-until-text), vote drafting (question/choices/preview → open ballot), Penny-drafted Friday digest, meeting prep, minutes publish.
  - `ExportSheet` from **lines 2480–2512**: QuickBooks / CSV rows → done state (`Synced to QuickBooks Online` / `ledger.csv downloaded`).
  - `Portfolio` from **lines 2447–2478**: 3 stat tiles (weighted collected %, open items, doors from lines 3714–3716), community cards with collected bars; tapping a community sets `activeCommunity` and enters `boardMode`.

- [ ] **Step 1: Write failing tests**

```tsx
it('board can approve the submitted ARC and resident status updates', () => {
  act(() => { const st = usePavStore.getState(); st.set({ arcType: 'Paint' }); st.submitArc(); st.set({ boardMode: true }); });
  render(<BoardDesk />);
  fireEvent.click(screen.getAllByRole('button', { name: /^approve$/i })[0]);
  expect(usePavStore.getState().arcApprovedByBoard).toBe(true);
  expect(screen.getByText(/resident notified, decisions log updated/i)).toBeInTheDocument();
});

it('vote nudge adds six households to quorum', () => {
  act(() => usePavStore.getState().set({ boardMode: true }));
  render(<BoardDesk />);
  fireEvent.click(screen.getByRole('button', { name: /nudge 49 households/i }));
  expect(screen.getByText(/93 of 136 households/i)).toBeInTheDocument();
});

it('broadcast requires text then confirms', () => {
  act(() => usePavStore.getState().set({ boardMode: true, boardTab: 'comms' }));
  render(<BoardDesk />);
  fireEvent.change(screen.getByPlaceholderText(/announce something/i), { target: { value: 'Pool closes early Friday' } });
  fireEvent.click(screen.getByRole('button', { name: /send broadcast/i }));
  expect(screen.getByText(/email digest goes out at 6 pm/i)).toBeInTheDocument();
});

it('portfolio drills into a community board desk', () => {
  act(() => usePavStore.getState().set({ role: 'manager', portfolioOpen: true }));
  render(<Portfolio />);
  fireEvent.click(screen.getByText('Cedar Hollow'));
  expect(usePavStore.getState().boardMode).toBe(true);
  expect(usePavStore.getState().activeCommunity).toBe(1);
});

it('export sheet completes CSV download state', () => {
  act(() => usePavStore.getState().set({ exportOpen: true }));
  render(<ExportSheet />);
  fireEvent.click(screen.getByRole('button', { name: /download csv/i }));
  expect(screen.getByText(/ledger\.csv downloaded/i)).toBeInTheDocument();
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** all three from cited ranges.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: board desk, ledger export, and manager portfolio"`

---

### Task 15: Onboarding + Sign-in

**Files:**
- Create: `src/screens/Onboarding.tsx`, `src/screens/SignIn.tsx`
- Modify: `src/App.tsx`
- Test: `src/screens/onboarding.test.tsx`

**Interfaces:**
- Consumes: store (`obOpen`, `obStep`, `hh`, `circles`, `obAutopay`, `loginOpen`), `HH`, `ONBOARD_CIRCLES`; `Toggle`.
- Produces: Onboarding from **lines 1451–1549** (progress dots, Skip; steps: welcome/deed-verified → household chips → circle chips → autopay toggle with dynamic CTA label per line 3384 → meet Penny; Back/Continue) and SignIn from **lines 2514–2535** (navy full-screen, P logomark, email/phone continue, "Just look around").

- [ ] **Step 1: Write failing tests**

```tsx
it('onboarding walks all five steps and lands home', () => {
  act(() => usePavStore.getState().set({ obOpen: true, obStep: 0 }));
  render(<Onboarding />);
  expect(screen.getByText(/welcome home, alex/i)).toBeInTheDocument();
  const next = () => fireEvent.click(screen.getByRole('button', { name: /continue|turn on autopay|take me home/i }));
  next(); next(); next(); next(); next();
  expect(usePavStore.getState().obOpen).toBe(false);
});

it('sign-in continue closes to app', () => {
  act(() => usePavStore.getState().set({ loginOpen: true }));
  render(<SignIn />);
  fireEvent.click(screen.getByRole('button', { name: /continue with email/i }));
  expect(usePavStore.getState().loginOpen).toBe(false);
});
```

Run — expected: FAIL.

- [ ] **Step 2: Implement** both.
- [ ] **Step 3: Run tests to verify pass.**
- [ ] **Step 4: Commit** — `git commit -m "feat: onboarding flow and sign-in screen"`

---

### Task 16: PWA, Playwright smoke, deploy

**Files:**
- Modify: `vite.config.ts`, `index.html`, `src/App.tsx` (mount any remaining overlays; remove placeholder stubs)
- Create: `public/pavilion-icon.svg` (pavilion glyph from prototype thumbnail lines 2568–2577: navy bg, peach roof triangle, cream walls, ember door), `playwright.config.ts`, `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: everything.
- Produces: installable PWA; a deployed Vercel URL.

- [ ] **Step 1: PWA config** — add `VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Pavilion', short_name: 'Pavilion', theme_color: '#1A3352', background_color: '#F5F0E6', display: 'standalone', icons: [{ src: '/pavilion-icon.svg', sizes: 'any', type: 'image/svg+xml' }] } })` to `vite.config.ts`; set `<title>Pavilion — Juniper Ridge</title>` + theme-color meta in `index.html`.

- [ ] **Step 2: Playwright smoke test**

`e2e/smoke.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('walk every tab and open key sheets without crashing', async ({ page }) => {
  await page.goto('/');
  for (const tab of ['Commons', 'Reserve', 'HOA', 'Today']) {
    await page.getByRole('button', { name: tab }).click();
  }
  await page.getByRole('button', { name: /review & pay/i }).click();
  await expect(page.getByText(/july assessment/i)).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('[data-testid="sheet-scrim"]').click();
  await page.getByRole('button', { name: /penny/i }).first().click();
  await expect(page.getByText(/ask me anything about juniper ridge/i)).toBeVisible();
});
```

`playwright.config.ts` uses `webServer: { command: 'npm run dev', port: 5173 }`. Run: `npx playwright test` — expected: PASS.

- [ ] **Step 3: Full verification** — `npx tsc --noEmit && npx vitest run && npm run build` — all pass. Manually compare each screen against the prototype (open `project/Pavilion App v9.dc.html` sections side by side) and fix visual drift.

- [ ] **Step 4: Commit** — `git commit -m "feat: PWA manifest, smoke test, deploy readiness"`

- [ ] **Step 5: Deploy** — push to a new GitHub repo (`gh repo create pavilion-v2 --private --source . --push`), then import in Vercel (framework: Vite) or `npx vercel --prod`. Verify the production URL renders the phone frame on desktop and full-bleed on a phone. Share URL with Nate.

---

## Self-review notes

- **Spec coverage:** every spec §2 surface maps to Tasks 6–15; theme/§3 → Tasks 1, 4, 5; data seam/§4 → Task 2; error handling/§5 → Task 5 (ErrorBoundary) + disabled-state buttons in Tasks 8–14; testing/§6 → per-task Vitest + Task 16 Playwright; deployment/§7 → Task 16; scenario switches → Task 5 BriefPanel + store flags (Task 3).
- **Type consistency:** store keys and action names (`book`, `submitArc`, `issuePass`, `pickRole`, `set`) are used identically across Tasks 3–15; selectors are `getX`/`useX` pairs throughout.
- **Fidelity:** visual detail intentionally lives in the committed prototype file at the cited line ranges rather than duplicated here — implementers must read their range in full before porting.
