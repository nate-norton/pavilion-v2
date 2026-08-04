---
name: Pavilion
description: Warm, plainspoken community software for self-managed HOAs
colors:
  porch-shade: "rgb(26 51 82)"
  porch-light-ember: "rgb(224 106 62)"
  porch-light-ember-deep: "rgb(172 80 45)"
  terracotta: "rgb(199 90 49)"
  blush: "rgb(251 237 228)"
  cream: "rgb(245 240 230)"
  paper: "rgb(255 254 250)"
  parchment: "rgb(249 245 236)"
  sand: "rgb(237 230 214)"
  sage: "rgb(42 157 92)"
  sagedark: "rgb(32 120 71)"
  mint: "rgb(233 246 238)"
  gold: "rgb(217 164 65)"
  golddark: "rgb(140 105 40)"
  goldpale: "rgb(251 243 224)"
  red: "rgb(199 64 46)"
  ink: "rgb(62 76 99)"
  stone: "rgb(107 101 89)"
  stonelight: "rgb(115 109 97)"
  bark: "rgb(91 85 74)"
  taupe: "rgb(99 93 82)"
typography:
  display:
    fontFamily: "Young Serif, serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Young Serif, serif"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.2
  title:
    fontFamily: "Young Serif, serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.3
  subtitle:
    fontFamily: "Young Serif, serif"
    fontSize: "19px"
    fontWeight: 400
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
    backgroundColor: "{colors.porch-light-ember-deep}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    typography: "{typography.body}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.porch-shade}"
    rounded: "{rounded.md}"
    padding: "14px 18px"
    typography: "{typography.body}"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.bark}"
    rounded: "{rounded.chip}"
    padding: "6px 14px"
  chip-active:
    backgroundColor: "{colors.porch-shade}"
    textColor: "{colors.cream}"
    rounded: "{rounded.chip}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.porch-shade}"
    rounded: "{rounded.lg}"
    padding: "14px"
  card-feature:
    backgroundColor: "{colors.porch-shade}"
    textColor: "{colors.cream}"
    rounded: "{rounded.xl}"
    padding: "18px"
  input:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.porch-shade}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Pavilion

## Overview

**Creative North Star: "The Front Porch"**

Pavilion is the software equivalent of a neighbor leaning on your porch rail to
tell you what happened at the meeting. It is soft, friendly, and playful where
most HOA software is a filing cabinet with a login screen. The palette is drawn
from the physical materials of a well-kept neighborhood — paper, sand, clay,
and the warm glow of a porch light after dark — and the interface behaves like
those materials: surfaces you can press, corners with no sharp edges, and
motion that has weight.

The density is deliberately unhurried. Cards breathe, targets are large, and
nothing is packed to the edges, because a resident meets this app for ninety
seconds at a time and should never feel behind. Warmth does the work that
chrome does elsewhere: there is no cold gray, no hairline-thin gridwork, and no
enterprise density. Every neutral in the system carries a little yellow in it.

The one place the playfulness holds its tongue is money, ballots, and
compliance. Those surfaces keep the same warm materials but drop the flourish —
no confetti on a fine, no bounce on a ballot. The Front Porch is where you hear
the news, not where the news gets softened.

**Key Characteristics:**
- Paper-and-clay palette; every neutral is warm, never gray
- A single chunky editorial serif for voice, a rounded sans for everything else
- Flat surfaces layered by tone, not by shadow
- Generously rounded, physically pressable components
- Accent color is rare by design, so it always means something

## Colors

A palette lifted from porch materials: paper and sand for surfaces, clay for
action, and a deep dusk blue for everything you read.

### Primary
- **Porch Shade** (rgb 26 51 82): The workhorse. All body text, the nav dock,
  the feature-card background, active chips and segments, and every avatar.
  A deep dusk blue that reads warm against cream rather than corporate.

### Secondary
- **Porch Light Ember** (rgb 224 106 62): The single warm glow — but a *fill*
  only: status dots, quorum progress, gradients, large display type. White on
  it measures 3.33:1, so it may never carry text.
- **Porch Light Ember Deep** (rgb 172 80 45): The same glow, text-safe. Every
  primary CTA and every ember-coloured word uses this (white on it 5.33:1,
  it on blush 4.65:1). Reaching for plain ember on a button reintroduces a
  WCAG 1.4.3 failure.
- **Blush** (rgb 251 237 228): The ember's whisper — pill backgrounds behind
  ember text, courtesy-notice panels, anything that needs the accent's warmth
  without its volume.

### Tertiary
- **Sage** (rgb 42 157 92) with **Mint** (rgb 233 246 238): Confirmation and
  good standing — paid, approved, resolved, open slots, healthy reserves.
- **Gold** (rgb 217 164 65) with **Goldpale** (rgb 251 243 224): Attention
  without alarm — pending states, courtesy notices, "needs a look."
- **Red** (rgb 199 64 46): Genuine failure only. Not for urgency, not for
  overdue; ember carries urgency.

### Neutral
- **Cream** (rgb 245 240 230): The page itself. Every screen sits on it.
- **Paper** (rgb 255 254 250): Cards and raised surfaces — the sheet of paper
  laid on the table.
- **Parchment** (rgb 249 245 236): Bottom sheets, input fields, and inset
  panels — a half-step warmer than paper, used when something is recessed
  rather than raised.
- **Sand** (rgb 237 230 214): Segmented-control tracks and quiet dividers.
- **Bark** (rgb 91 85 74) / **Taupe** (rgb 99 93 82): Secondary body text.
- **Stone** (rgb 107 101 89) / **Stonelight** (rgb 115 109 97): Labels,
  captions, inactive nav, and metadata.
- **Ink** (rgb 62 76 99): Long-form reading text where full Porch Shade would
  be too heavy.

### Sequential scales

Two groups of near-identical hues are **not** palette drift, and a consolidation
pass should leave them alone — collapsing any step flattens a chart:

- **Reserve-funding forecast** (six steps, lightest year to darkest):
  Sagemist '26 → Sagesoft '27 → Sagecool '28 → Sagelight '29 → Sagemid '30 →
  Sage '31. Grouped and commented as a block in `src/index.css`.
- **Delinquency aging** (five steps, current to severe): Sage → Gold → Peach →
  Terracotta → Reddeep. Note it deliberately climbs the severity ladder rather
  than fading one hue, because the buckets mean escalating trouble, not more
  of the same thing.

### Named Rules

**The Porch Light Rule.** The ember accent appears on at most one primary
action per view. It is the light you walk toward; two lights and you don't know
which porch is yours. Everything else uses paper, sand, or Porch Shade.

**The Text-Bearing Accent Rule.** Ember is a fill; Ember Deep carries text.
Any colour that sits under white, or is itself set as type, must clear 4.5:1 on
every bed it lands on — which is why sage, gold and sky each have a dark
variant and the bright ones never appear as words.

**The No Gray Rule.** There is no neutral gray in this system. Every neutral is
warmed with yellow — cream, sand, parchment, stone, taupe, bark. A `#888` gray
anywhere is a bug, not a choice.

**The Severity Ladder Rule.** Sage means done, gold means look at this, ember
means act now, red means something broke. Never substitute one for another to
raise emotional volume.

## Typography

**Display Font:** Young Serif (with `serif` fallback), self-hosted, weight 400 only
**Body Font:** Nunito Sans (with `system-ui`, `sans-serif`), weights 400/600/700/800

**Character:** A chunky, slab-ish editorial serif carrying every human moment —
greetings, section titles, dollar amounts — against a rounded humanist sans
doing all the work. The serif is the neighbor's voice; the sans is the
information. The pairing is what keeps the app from reading like a utility
bill.

### Hierarchy
- **Display** (400, 36px, 1.1): The dollar amount on a dues sheet and the
  morning greeting. One per screen at most.
- **Headline** (400, 24–30px, 1.2): Screen titles — "The Commons", "Reserve",
  "The HOA, in the open".
- **Title** (400, 17–22px, 1.3): Card and section headings, sheet titles.
- **Body** (700, 13px, 1.5): The default. Note the weight: body copy runs bold
  because it sits at 13px on a warm background and needs the density.
- **Secondary body** (600–700, 11.5–12.5px, 1.5): Sub-lines, metadata, and
  card descriptions in stone or taupe.
- **Label** (700–800, 10–11px, 0.12em, uppercase): Section eyebrows, status
  pills, nav labels. The wide tracking is the system's signature.

### Named Rules

**The One Serif Rule.** Young Serif ships at weight 400 only. Never apply
`font-bold` or heavier to serif text — the browser will synthesize a faux bold
and the whole system looks counterfeit. If a serif heading needs more presence,
increase its size.

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
through the warm neutral ramp — cream page, paper card, parchment inset — and
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

**The Tinted Shadow Rule.** Shadows are never neutral black. They carry Porch
Shade or the warm scrim (`rgb 26 30 20`), so shade stays inside the palette.

## Shapes

Softness is the form language and it is not subtle. Corner radii run generous
and scale with the element's size: 11px for inner rows and small buttons, 13px
for standard cards and inputs, 18–20px for major cards and panels, 26px for the
nav dock, and 28px on the top corners of bottom sheets. Chips, avatars, status
dots, and toggles are fully round.

Borders are hairlines at low-alpha Porch Shade (`0.06` for dividers, `0.12–0.14`
for interactive outlines) — present enough to define an edge, never enough to
draw a grid. There are no square corners anywhere in the system, and no heavy
strokes.

**The No Sharp Corners Rule.** Nothing in Pavilion has a 0px radius. The
smallest radius in the system is 5px, and that is a progress-bar cap.

## Components

### Buttons
- **Shape:** Generously rounded (13px), or fully round for icon buttons
- **Primary:** Porch Light Ember background, paper text, ~14px vertical padding,
  extrabold 13–14px sans. Full-width in sheets.
- **Secondary:** Paper background, Porch Shade text, hairline border at 12–14%
  Porch Shade.
- **Dark:** Porch Shade background with cream text, used for affirmative actions
  inside ember-heavy contexts (e.g. "Pass this to the board").
- **Press / Hover:** Every pressable surface scales to 0.97 on `:active` over
  120ms; hover-capable devices add the hover-lift shadow. This press feedback is
  global and applies to cards and rows, not just buttons.
- **Disabled:** Reduced opacity (~0.6) with the same geometry; never a gray
  swap.

### Chips
- **Style:** Fully round pills, 14px horizontal padding, extrabold 12.5px
- **Inactive:** Paper background, bark text, hairline Porch Shade border
- **Active:** Porch Shade background, cream text, no border

### Cards / Containers
- **Corner Style:** 18px for major cards, 13px for inner rows, 20px for feature
  cards
- **Background:** Paper on the cream page; Porch Shade for feature cards that
  must dominate (the open vote, the amenity pass banner)
- **Shadow Strategy:** None at rest — see Elevation
- **Border:** Hairline at 6–8% Porch Shade, or none when tone alone separates
- **Internal Padding:** 14–18px

### Inputs / Fields
- **Style:** Parchment fill, hairline border at 14% Porch Shade, 13px radius,
  12×16px padding, semibold Porch Shade text
- **Placeholder:** Stone
- **Focus:** A global `:focus-visible` ring (2px Porch Light Ember Deep, 2px
  offset) applies everywhere and inverts to cream on Porch Shade surfaces. It
  is declared at the global layer specifically so it survives the `outline-none`
  utilities scattered through the screens

### Navigation
- **Style:** A floating Porch Shade dock, 66px tall, 26px radius, spanning five
  slots with the Ask AI button raised 10px above the rail in an ember gradient
  ring
- **Typography:** 10px extrabold labels beneath 21px icons
- **States:** Cream at full strength when active; cream at reduced strength when
  not
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
A 7px round dot in ember, gold, or sage that prefixes an actionable row. The
system's smallest and most-repeated signal: it carries severity before any text
is read.

## Do's and Don'ts

### Do:
- **Do** warm every neutral. Reach for cream, sand, parchment, stone, taupe, and
  bark — never a neutral gray.
- **Do** keep the ember accent to one primary action per view (The Porch Light
  Rule).
- **Do** set human moments and dollar amounts in Young Serif at weight 400, and
  raise size rather than weight when they need presence.
- **Do** run sans body copy at 600–800; at 13px on warm paper, lighter weights
  disappear.
- **Do** express hierarchy with tone and hairline borders. Save shadow for the
  dock, the sheet, and hover.
- **Do** give every tappable surface the 0.97 press response — it is the system's
  most recognizable physical trait.
- **Do** keep the severity ladder honest: sage done, gold look, ember act, red
  broken.
- **Do** honor `prefers-reduced-motion`; the global override is already wired and
  new animation must not bypass it.

### Don't:
- **Don't** apply bold weights to Young Serif. Only 400 is loaded and the
  synthesized bold looks counterfeit.
- **Don't** introduce a 0px radius. Nothing in this system has a sharp corner.
- **Don't** use neutral black shadows, or add shadows to cards at rest.
- **Don't** use red for urgency or overdue states — that is ember's job. Red
  means something is broken.
- **Don't** let playfulness reach money, ballots, or compliance. Same materials,
  no flourish: no confetti on a fine, no bounce on a ballot.
- **Don't** pack density in to fit more content. If a screen is crowded, it is
  doing too much for a ninety-second visit.
- **Don't** add a new one-off color. The palette already carries known
  near-duplicate drift (documented in `src/index.css`); adding to it makes the
  eventual consolidation harder.
