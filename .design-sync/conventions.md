# Pavilion Design System — how to build with it

Pavilion is a warm, earth-toned system for community / HOA apps: a cream
canvas, ink-navy text, terracotta warmth, a Young Serif + Nunito Sans pairing,
and small tactile primitives. Import components from the bundle
(`window.PavilionDS.*`); style your own layout glue with the token idiom below.

## No provider needed — tokens are global

Every design token is defined on `:root` in the shipped `styles.css` closure,
so components render fully styled with **no wrapper**. Just render them.

`ThemeProvider` is only for **per-community rebranding**: wrap a subtree and
pass a `tokens` map to override accent colors (the CTA/badge/highlight family)
while navy text and surfaces stay put:

```jsx
const { ThemeProvider, SegmentedControl, Pill } = window.PavilionDS;

<ThemeProvider tokens={{ ember: '58 115 181', terracotta: '46 92 145' }}>
  <Pill label="Board" bg="rgb(var(--skypale))" color="rgb(var(--skydeep))" />
</ThemeProvider>
```

## The styling idiom — `rgb(var(--token))`, not utility classes

Color is a CSS custom property holding a **space-separated RGB triplet**.
Reference it as `rgb(var(--<token>))`, and get any opacity with the slash form
`rgb(var(--<token>) / 0.1)`. Use this in inline styles or your own CSS for all
layout glue. (Do **not** rely on Tailwind utility classes like `bg-navy` — the
shipped stylesheet is purged, so arbitrary utilities may be absent. The
`var(--token)` values are always defined.)

**Prefer the semantic aliases** so a rebrand stays a one-token edit:
`--color-bg` (canvas), `--color-surface` (cards/sheets), `--color-primary`,
`--color-text`, `--color-muted`, `--color-accent`, `--color-danger`,
`--color-success`.

**Core ramp** (reach for by name): `--navy` `--cream` `--paper` `--sand`
`--parchment` `--ember` `--terracotta` `--blush` `--peach` `--sage` `--mint`
`--sagedark` `--gold` `--goldpale` `--golddark` `--sky` `--skydeep` `--skypale`
`--ink` `--stone` `--stonelight` `--bark` `--taupe` `--red`. (A wider set of
extended one-off tokens exists in `styles.css` — read it before inventing.)

**Type**: Young Serif for display/headings, Nunito Sans (weights 400/600/700/800)
for everything functional — `font-family: 'Young Serif', serif` /
`'Nunito Sans', sans-serif`. **Radius** is generous (controls ~11–14px, cards
16–20px, pills full). **Elevation** is soft, navy-tinted shadows, never black.

## Component color props also take tokens

Several primitives take color **as props** (not classes) — pass the same
`rgb(var(--token))` strings:

```jsx
const { Avatar, Pill, ProgressBar, PhIcon } = window.PavilionDS;

<Avatar initial="A" color="rgb(var(--navy))" size={40} />
<Pill label="Paid" bg="rgb(var(--mint))" color="rgb(var(--sagedark))" />
<ProgressBar pct={64} color="rgb(var(--sage))" track="rgb(var(--sage) / 0.15)" />
<PhIcon name="ph-fill ph-swimming-pool" size={24} color="rgb(var(--terracotta))" />
```

`PhIcon`'s `name` is a Phosphor class string: `ph-fill` / `ph-bold` / (regular)
weight + `ph-<icon>` (e.g. `ph-fill ph-calendar-check`).

## Where the truth lives

Read `styles.css` and its imports for the full token/`:root` definitions and
font faces. Each component ships a `<Name>.d.ts` (its exact prop contract) and
a `<Name>.prompt.md` (usage + examples) — read those before composing a
component. Components: Avatar, BackButton, Chip, Pill, ProgressBar,
SegmentedControl, StatusTimeline, Toggle, TypingDots, PhotoPlaceholder, PhIcon
(+ ThemeProvider).
