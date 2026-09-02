---
name: Pavilion
description: Clear, plainspoken community software for self-managed HOAs
colors:
  navy: "rgb(26 51 82)"
  mist: "rgb(238 246 255)"
  paper: "rgb(255 255 255)"
  mistpale: "rgb(244 249 255)"
  skyborder: "rgb(212 232 248)"
  sky: "rgb(74 144 226)"
  skydeep: "rgb(52 103 162)"
  accent: "rgb(30 102 186)"
  accenttint: "rgb(220 235 251)"
  sunset: "rgb(249 123 75)"
  sunsetdeep: "rgb(185 55 6)"
  sunsetbright: "rgb(255 179 71)"
  peach: "rgb(255 222 175)"
  sage: "rgb(42 157 92)"
  sagedark: "rgb(31 117 69)"
  mint: "rgb(232 248 239)"
  gold: "rgb(245 158 11)"
  golddark: "rgb(143 92 6)"
  goldpale: "rgb(255 246 229)"
  red: "rgb(239 68 68)"
  reddeep: "rgb(205 18 18)"
  ink: "rgb(62 76 99)"
  slate: "rgb(70 95 115)"
  slatelight: "rgb(78 106 128)"
  slatedeep: "rgb(62 85 102)"
  slatedark: "rgb(53 72 87)"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "36px"
    fontWeight: 900
    letterSpacing: "-0.03em"
    lineHeight: 1.1
  headline:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 900
    letterSpacing: "-0.03em"
    lineHeight: 1.2
  subtitle:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 900
    letterSpacing: "-0.03em"
    lineHeight: 1.3
  title:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 900
    letterSpacing: "-0.03em"
    lineHeight: 1.3
  body-lg:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.5
  body:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 700
    lineHeight: 1.5
  body-sm:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    lineHeight: 1.5
  meta:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 700
    lineHeight: 1.45
  meta-sm:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.45
  caption:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 700
    lineHeight: 1.4
  label:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.12em"
  label-sm:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "10.5px"
    fontWeight: 800
    letterSpacing: "0.1em"
  micro:
    fontFamily: "Nunito Sans, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 800
    letterSpacing: "0.08em"
rounded:
  focus: "4px"
  bubble-tail: "6px"
  chip: "999px"
  sm: "11px"
  md: "13px"
  lg: "18px"
  xl: "20px"
  stack: "26px"
  sheet: "28px"
  dock: "26px"
spacing:
  xs: "6px"
  sm: "10px"
  md: "14px"
  lg: "18px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.skydeep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    typography: "{typography.body}"
  button-on-chrome:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.skydeep}"
    rounded: "{rounded.chip}"
    padding: "9px 15px"
    typography: "{typography.body-sm}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    typography: "{typography.body}"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.slatedark}"
    rounded: "{rounded.chip}"
    padding: "6px 14px"
  chip-active:
    backgroundColor: "{colors.skydeep}"
    textColor: "{colors.mist}"
    rounded: "{rounded.chip}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    rounded: "{rounded.lg}"
    padding: "14px"
  card-feature:
    backgroundColor: "{colors.skydeep}"
    textColor: "{colors.mist}"
    rounded: "{rounded.xl}"
    padding: "18px"
  input:
    backgroundColor: "{colors.mistpale}"
    textColor: "{colors.navy}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---
# Design System: Pavilion

## Overview

**Creative North Star: "The Front Porch, in daylight"**

Pavilion is the software equivalent of a neighbor leaning on your porch rail to
tell you what happened at the meeting. It is soft, friendly, and playful where
most HOA software is a filing cabinet with a login screen.

The materials changed in the sky/sunset pass and the metaphor moved with them.
The palette used to be drawn from clay and lamplight — every neutral warmed
with yellow. It is now drawn from **open sky and morning light**: a pale mist
ground, white cards laid on it, ink for everything you read, and sunset kept
back as the one warm glow. The porch is the same porch; it is nine in the
morning rather than nine at night. Interface behaviour is unchanged — surfaces
you can press, corners with no sharp edges, motion with weight.

The density is deliberately unhurried. Cards breathe, targets are large, and
nothing is packed to the edges, because a resident meets this app for ninety
seconds at a time and should never feel behind.

The one place the playfulness holds its tongue is money, ballots, and
compliance. Those surfaces keep the same materials but drop the flourish — no
confetti on a fine, no bounce on a ballot. The Front Porch is where you hear
the news, not where the news gets softened.

**Key Characteristics:**
- Sky-and-light palette; neutrals are cool slate, never warm and never grey
- One display face at Black weight for voice, a rounded sans for everything else
- Flat surfaces layered by tone, not by shadow
- Generously rounded, physically pressable components
- The warm accent is rare by design, so it always means something

## Colors

Sky primary, sunset accent, ink text on a mist ground. Values live in
`src/index.css` `:root` and are transcribed here; `tailwind.config.ts`
generates its colour map from that block, so every token is a class of the
same name.

### Primary
- **Sky family.** `--accent` (rgb 30 102 186) is the brand's working blue —
  links, pills, active states, and the accent copy that per-community theming
  remaps. `--skydeep` (rgb 52 103 162) is the chrome and the primary button:
  the nav dock, hero cards, avatars. `--sky` (rgb 74 144 226) is the bright
  decorative fill and **may never carry text** — white on it is 3.29:1.
- **Navy / ink** (rgb 26 51 82): headings and dark type. **Navy is a text
  colour, not a surface.** Reintroducing `bg-navy` puts back the heavy dark
  chrome this system deliberately dropped.

### Secondary — the warm accent
- **Sunset** (rgb 249 123 75): the single warm glow, and a *fill* — gradients,
  the dues progress bar, large display type. White on it measures 2.64:1, so it
  never carries white text. It does carry **navy** at 4.86:1, which is how the
  AI mark and the waitlist CTA keep the real orange instead of the burnt one.
- **Sunset Bright** (rgb 255 179 71): the amber far stop of the brand gradient,
  `#F97B4B → #FFB347`. Navy on it is 7.19:1, white 1.78:1.
- **Sunset Deep** (rgb 185 55 6): the same glow, text-safe *under white*. Used
  for sunset-coloured words on a light bed and for the focus ring (white on it
  5.81:1).
- **Peach** (rgb 255 222 175): eyebrow text on chrome — 4.52:1 on skydeep and
  9.96:1 on navy, so it works on either dark surface.

### Tertiary
- **Sage** (rgb 42 157 92) with **Mint** (rgb 232 248 239): confirmation and
  good standing — paid, approved, resolved, open slots, healthy reserves.
- **Gold** (rgb 245 158 11) with **Goldpale** (rgb 255 246 229): attention
  without alarm — pending states, courtesy notices, "needs a look."
- **Red** (rgb 239 68 68) / **Reddeep** (rgb 205 18 18): genuine failure only.
  Not for urgency, not for overdue; sunset carries urgency.

### Neutral
- **Mist** (rgb 238 246 255): the page itself. Every screen sits on it.
- **Paper** (rgb 255 255 255): cards and raised surfaces.
- **Mistpale** (rgb 244 249 255): input fields and inset panels — used when
  something is recessed rather than raised.
- **Skyborder** (rgb 212 232 248): segmented-control tracks and quiet dividers.
- **Ink** (rgb 62 76 99): long-form reading text where full navy is too heavy.
- **The slate ramp** — `slatelight` (rgb 78 106 128) → `slate` (70 95 115) →
  `slatedeep` (62 85 102) → `slatedark` (53 72 87): labels, captions, inactive
  nav, metadata, secondary body. The ramp is compressed on purpose: the brand
  sheet's own slate `#6B8BA4` measures 3.29:1 on mist and fails, so the
  lightest step is anchored at the AA floor and the rest step down from there.

### Sequential scales

Two groups of near-identical hues are **not** palette drift, and a
consolidation pass should leave them alone — collapsing any step flattens a
chart:

- **Reserve-funding forecast** (six steps, lightest year to darkest):
  Sagemist '26 → Sagesoft '27 → Sagecool '28 → Sagelight '29 → Sagemid '30 →
  Sage '31. Grouped and commented as a block in `src/index.css`. Kept green
  rather than recoloured to sky: green is the success hue here too, and the
  chart's meaning is "healthy through 2032".
- **Delinquency aging** (five steps, current to severe): Sage → Gold → Sunset →
  Sunset Deep → Reddeep. It deliberately climbs the severity ladder by hue
  rather than fading one colour, because the buckets mean escalating trouble.
  The palette swap briefly broke this — `peach` became a pale warm that
  *lightened* mid-ladder and `accent` became sky, putting a blue bucket between
  two reds. If a bucket colour ever stops escalating, that is the bug.

### Named Rules

**The Porch Light Rule.** The *warm* accent appears on at most one primary
moment per view — the AI mark, a progress fill, an RSVP. It is the light you
walk toward; two lights and you don't know which porch is yours. Sky is the
opposite: it is the working colour and appears wherever something is tappable.

**The Text-Bearing Accent Rule.** Each accent has a decorative value and a
darker text-bearing twin. Fills use the base; anything that sits under white,
or is itself set as type, uses the twin:

| Fill | Twin |
|---|---|
| `sunset` | `sunsetdeep` |
| `sky` | `accent` (copy, CTAs) or `skydeep` (chrome) |
| `sage` | `sagedark` |
| `gold` | `golddark` |

**Every value here was solved against these surfaces, not copied from a brand
sheet.** The sheet's own pairs fail: sunset under white is 2.64:1, sky under
white 3.29:1, slate on mist 3.29:1. Two further corrections the sheet needed —
its `skypale` was the same value as the page ground, which makes a sky pill
invisible, and its `skydeep` clears 4.88:1 on white but only 4.48:1 on mist,
where ~20 call sites set it as type. **Check a text-bearing colour against the
mist page, not only against its own tinted pill.**

**A brand theme that overrides `accent` must clear the same floor** against
mist and against its own `accenttint`. `src/theme/tokens.test.ts` asserts that
every theme override names a real token, but it cannot check contrast — that
part is still on you.

**The Chrome Contrast Rule.** A control sitting *on* chrome cannot be sunset:
`sunset` has 2.21:1 luminance separation from `skydeep` and `sunsetdeep` has
1.00:1, so the button disappears into the card. Use a white pill with
`text-skydeep` (5.82:1 for both the boundary and the label). Secondary text on
chrome needs at least 0.9 alpha — the 0.55–0.8 that worked on navy does not
clear AA on the lighter sky.

**The No Grey Rule.** There is still no neutral grey in this system, but the
correction runs the other way now: every neutral is cooled toward blue — mist,
mistpale, skyborder, and the slate ramp. A `#888` grey is a bug, and so is a
warm beige left over from the old palette.

**The Severity Ladder Rule.** Sage means done, gold means look at this, sunset
means act now, red means something broke. Never substitute one for another to
raise emotional volume.

## Typography

**Display Font:** Nunito, weight **900 (Black)** with `-0.03em` tracking
**Body Font:** Nunito Sans (with `system-ui`, `sans-serif`), weights 400/600/700/800

Both load from Google Fonts, linked in `index.html`. They were declared in
`tailwind.config.ts` for a long time without ever being fetched, so the app
rendered in system serif and system-ui until the sky/sunset pass linked them.

**`font-serif` is a historical key name.** The display face used to be Young
Serif; it is now Nunito Black. The Tailwind key was left alone because renaming
it would touch every heading in the app for no user-visible gain, and the
doubled selector `.font-serif.font-serif` in `src/index.css` applies the weight
and tracking. **Do not "fix" it back to a serif.**

**Character:** One family doing both jobs at opposite ends of its weight range —
Black for every human moment (greetings, section titles, dollar amounts),
regular-to-extrabold for the information underneath. The tight tracking on
display is what keeps the Black weight from reading as shouting.

### Hierarchy

The ramp is a **fixed set of steps, not ranges.** It previously read as ranges
here while the front-matter tokens listed exact values, and the two disagreed —
which let 58 off-ramp literals (9, 15, 18, 20, 22, 26, 28, 30, 32, 34px)
accumulate across the screens while each one looked locally defensible. Every
size in the app is now one of the steps below, and a new step is added here
first or not at all.

- **Display** (400, 36px, 1.1): The morning greeting, the onboarding hero, and
  the dollar amount on a dues sheet. One per screen at most.
- **Headline** (400, 24px, 1.2): Every screen title — "The Commons",
  "Reserve", "The HOA, in the open", "Documents", "Messages".
- **Subtitle** (400, 19px, 1.3): Sheet titles and confirmations — "Create a
  group", "Paid. Done in two taps."
- **Title** (400, 17px, 1.3): Card and section headings, the open-vote title.
- **Body large** (600, 14px, 1.5): Primary CTA labels and emphasized lines
  inside sheets.
- **Body** (700, 13.5/13px, 1.5): The default. Note the weight: body copy runs
  bold because it sits small on a warm background and needs the density.
- **Secondary body** (600–700, 11.5/12/12.5px, 1.5): Sub-lines, metadata, and
  card descriptions in slate or slatedeep.
- **Label** (700–800, 10/10.5/11px, 0.12em, uppercase): Section eyebrows,
  status pills, nav labels. The wide tracking is the system's signature.

**Screen titles lost a level in this pass.** Primary tabs sat at 28px and
secondary screens at 26px — a real two-step distinction that the token ramp has
no room for, so both collapsed to Headline. If that hierarchy is worth keeping,
it comes back as a documented `headline-lg` step, not as a literal.

### Named Rules

**The One Display Weight Rule.** Display type is Nunito 900 and nothing else.
Do not set a heading to 700 to make it "quieter" — drop it a size step instead.
The inverse of the old rule, which forbade bold on a 400-only serif: the
constraint is still one weight, the weight is just now the heaviest one.

**The Bold Floor Rule.** Sans text at or below 13px is never lighter than 600.
Warm backgrounds eat thin type.

## Layout

A single-column mobile canvas, currently rendered inside a fixed 393×830 frame
on every viewport and collapsing to full-bleed below 500px. Screens scroll
under fixed chrome with hidden scrollbars (`.pav-scroll`).

Standard screen padding is 18px horizontal, with roughly 60px of top inset for
the status area and 40px+ of bottom clearance so content never hides behind the
floating dock. Cards stack with 10–14px gaps; related rows inside a card
separate with hairline dividers rather than whitespace.

Spacing rhythm runs on a loose 4px grid, clustering at 6 / 10 / 14 / 18 / 24px.
Density is intentionally low: a card row is ~44px minimum. Tap targets clear
the WCAG 2.2 AA floor of 24×24 everywhere, and most reach 36px+, but several
inline controls sit between 25px and 38px — the 44px platform convention is an
aspiration here, not a rule the system currently keeps.

**The Dock Clearance Rule.** The nav dock floats 14px above the safe-area
inset. Every scrollable screen ends with at least 40px of padding so the last
row is never trapped beneath it.

## Elevation & Depth

The system is **flat with tonal layering**. Depth is communicated by stepping
through the cool neutral ramp — mist page, paper card, mistpale inset — and
by hairline borders at `rgb(26 51 82 / 0.06–0.14)`, not by shadow. Most
surfaces in the app cast nothing at all.

Shadows are reserved for things that genuinely float above the page, plus one
hover affordance.

### Shadow Vocabulary
- **Floating dock** (`0 18px 40px -14px rgb(26 51 82 / 0.55)`): The nav dock
  only. Long, soft, and tinted with the dock's own color.
- **Bottom sheet** (`0 -18px 50px rgb(26 30 20 / 0.25)`): Cast upward, since
  the sheet rises from below.
- **Raised segment** (`0 2px 6px rgb(26 51 82 / 0.1)`): The active segment in a
  light segmented control. The smallest shadow in the system.
- **Hover lift** (`0 2px 8px rgb(26 51 82 / 0.08)`): Applied to pressable cards
  on hover-capable devices only.

### Named Rules

**The Floating-Only Rule.** If it doesn't float above the page or respond to a
pointer, it casts no shadow. Card hierarchy is expressed in tone and border,
never in elevation.

**The Tinted Shadow Rule.** Shadows are never neutral black. They carry
`--shadow` (rgb 26 51 82, ink) or the scrim (`--scrim`, rgb 12 20 35), so shade
stays inside the palette. Both cooled with the palette; a warm-brown shadow left
over from the old system is a bug.

## Shapes

Softness is the form language and it is not subtle. Corner radii run generous
and scale with the element's size: 11px for inner rows and small buttons, 13px
for standard cards and inputs, 18–20px for major cards and panels, 26px for the
nav dock, and 28px on the top corners of bottom sheets. Chips, avatars, status
dots, and toggles are fully round.

Borders are hairlines at low-alpha navy (`0.06` for dividers, `0.12–0.14`
for interactive outlines) — present enough to define an edge, never enough to
draw a grid. There are no square corners anywhere in the system, and no heavy
strokes.

**The No Sharp Corners Rule.** Nothing in Pavilion has a 0px radius. The
smallest radius in the system is 5px, and that is a progress-bar cap.

## Components

### Buttons
- **Shape:** Generously rounded (13px), or fully round for icon buttons
- **Primary:** `--skydeep` background, paper text, ~14px vertical padding,
  extrabold 13–14px sans. Full-width in sheets.
- **On chrome:** a **white pill with `text-skydeep`**, used for any control
  sitting on a sky hero — the Today RSVP, the HOA ballot. A sunset fill there
  has 1.00–2.21:1 separation from the card and vanishes; see The Chrome
  Contrast Rule.
- **Secondary:** Paper background, navy text, hairline border at 12–14% navy.
- **Warm:** `--sunsetdeep` background with white text, reserved for the places
  the brand sheet names — RSVP on a light card, the AI mark.
- **Press / Hover:** Every pressable surface scales to 0.97 on `:active` over
  120ms; hover-capable devices add the hover-lift shadow. This press feedback is
  global and applies to cards and rows, not just buttons.
- **Disabled:** Reduced opacity (~0.6) with the same geometry; never a gray
  swap.

### Chips
- **Style:** Fully round pills, 14px horizontal padding, extrabold 12.5px
- **Inactive:** Paper background, slatedark text, hairline navy border
- **Active:** `--skydeep` background, mist text, no border

### Cards / Containers
- **Corner Style:** 18px for major cards, 13px for inner rows, 20px for feature
  cards
- **Background:** Paper on the mist page; `--skydeep` for feature cards that
  must dominate (the open vote, the taco-cart hero, the amenity pass banner)
- **Shadow Strategy:** None at rest — see Elevation
- **Border:** Hairline at 6–8% navy, or none when tone alone separates
- **Internal Padding:** 14–18px

### Inputs / Fields
- **Style:** Mistpale fill, hairline border at 14% navy, 13px radius,
  12×16px padding, semibold navy text
- **Placeholder:** Slate
- **Focus:** A global `:focus-visible` ring (2px `--sunsetdeep`, 2px offset)
  applies everywhere and inverts to mist on chrome. Warm against a cool ground
  so it reads as a ring rather than as more sky; on `--skydeep` the sunset ring
  is 1.00:1 and invisible, which is why the inversion selector must list every
  chrome class. It
  is declared at the global layer specifically so it survives the `outline-none`
  utilities scattered through the screens

### Navigation
- **Style:** A floating `--skydeep` dock, 66px tall, 26px radius, spanning five
  slots with the Ask AI button raised 10px above the rail, filled with the
  `.bg-ai` sunset→amber gradient behind a navy glyph and ringed in mist
- **Typography:** 10px extrabold labels beneath 21px icons
- **States:** Mist at full strength when active; mist at 0.9 alpha when not —
  the old 0.62 fails AA on the lighter sky chrome
- **Motion:** Tab changes slide horizontally in the direction of travel (300ms,
  `cubic-bezier(0.22,1,0.36,1)`)

### Bottom Sheet (signature)
The primary surface for any focused task — paying, requesting, reporting,
asking. Parchment panel rising from the bottom edge over a 40% warm scrim, 28px
top corners, a 40×4px grab handle centered above the content, capped at 90%
height. Enters on a slight overshoot curve (320ms
`cubic-bezier(0.32,1.2,0.5,1)`) so it feels physical. Dismisses on scrim tap or
Escape.

### Status Dot
A 7px round dot in sunset, gold, or sage that prefixes an actionable row. The
system's smallest and most-repeated signal: it carries severity before any text
is read.

## Do's and Don'ts

### Do:
- **Do** cool every neutral. Reach for mist, mistpale, skyborder, and the slate
  ramp — never a neutral grey, and never a warm beige left over from the old
  palette.
- **Do** keep the *warm* accent to one moment per view (The Porch Light Rule).
  Sky is the working colour and may appear wherever something is tappable.
- **Do** set human moments and dollar amounts in Nunito 900, and drop a size
  step rather than a weight when they need to be quieter.
- **Do** use a white pill with `text-skydeep` for any button sitting on chrome.
- **Do** run sans body copy at 600–800; at 13px on warm paper, lighter weights
  disappear.
- **Do** express hierarchy with tone and hairline borders. Save shadow for the
  dock, the sheet, and hover.
- **Do** give every tappable surface the 0.97 press response — it is the system's
  most recognizable physical trait.
- **Do** keep the severity ladder honest: sage done, gold look, sunset act, red
  broken.
- **Do** honor `prefers-reduced-motion`; the global override is already wired and
  new animation must not bypass it.

### Don't:
- **Don't** lighten display type below 900, and don't rename `font-serif` back
  to a serif — it is Nunito Black under a historical key.
- **Don't** put navy behind anything. Navy is text; chrome is `--skydeep`.
- **Don't** put a sunset fill on sky chrome — it has 1.00-2.21:1 separation and
  disappears into the card.
- **Don't** introduce a 0px radius. Nothing in this system has a sharp corner.
- **Don't** use neutral black shadows, or add shadows to cards at rest.
- **Don't** use red for urgency or overdue states — that is sunset's job. Red
  means something is broken.
- **Don't** let playfulness reach money, ballots, or compliance. Same materials,
  no flourish: no confetti on a fine, no bounce on a ballot.
- **Don't** pack density in to fit more content. If a screen is crowded, it is
  doing too much for a ninety-second visit.
- **Don't** add a new one-off color. The palette already carries known
  near-duplicate drift (documented in `src/index.css`); adding to it makes the
  eventual consolidation harder.
