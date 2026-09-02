# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: residents of self-managed HOA communities** — homeowners (and
tenants, a distinct role with narrower access) checking in from a phone,
usually in short bursts: paying an assessment, seeing whether a vote closed,
booking the cabana, reading what neighbors posted. They did not choose this
software and have low tolerance for it; the product earns its place by being
faster than the alternative (email threads, Facebook groups, a paper notice on
the mailbox).

**Board members are the buyer and a secondary user.** Volunteers, not
professionals, doing HOA work in the margins of their own lives — approving an
ARC request, answering a report, opening a vote, publishing minutes. They use
the same app with an additional Board Desk surface.

Product decisions optimize the resident experience first. Resident engagement
is the asset the product is built on; board tooling exists to serve the buyer
and to make that engagement worth something.

## Product Purpose

Give a self-managed HOA one honest place for the things a community actually
has to do together: money, votes, decisions, shared amenities, and neighbor
communication. Success is a community where a resident can answer "what is my
HOA doing with my money, and what was decided" without asking anyone.

## Positioning

**Radical transparency as the mechanism, not a feature.** Every dollar, vote,
and decision is visible to every household by default — dues are shown itemized
into where they go, votes show live tallies and quorum against the real
household count, ARC decisions and their reasoning are published, and ballots
are secret but receipted.

A neighboring product could copy the screens but not the posture: incumbents
sell to management companies, so their software is optimized for the manager's
workflow and residents are an afterthought who mostly receive PDFs. Pavilion's
resident-side engagement is the thing an operations-first competitor cannot
truthfully claim.

## Operating Context

- **Self-managed HOAs** — volunteer boards, no professional manager. Serving
  professional management companies is deliberately deferred to a later
  additive phase; no portfolio concept is being designed for now. An
  *account* may belong to more than one community (a founder who piloted
  one, an owner in two), and the app shows one community at a time.
- Residents use it on phones, in short sessions, often triggered by a real
  event (a notice, a due date, a neighbor's post).
- Board work is episodic and low-volume — a handful of ARC requests,
  violations, and votes per month, plus a meeting cycle — done by volunteers
  between other obligations.
- The product runs alongside things it does not replace: the community's
  existing bookkeeping, its legal counsel for escalated compliance, and its
  governing documents (CC&Rs, bylaws) as the source of truth for rules.
- Two deployed surfaces from one codebase: a scripted presenter demo used for
  sales, and the real product. They must never be confused for each other.

## Capabilities and Constraints

**Confirmed capabilities:** dues and itemized assessments; community votes with
quorum tracking and secret receipted ballots; ARC (architectural review)
requests and board decisions; compliance notices with a self-cure path;
amenity reservations and guest passes; a neighbor feed with groups, events, and
a private board-reporting channel; document library; direct and board
messaging; meeting scheduling and minutes.

**Roles:** live roles are `resident` and `board`. The demo additionally
scripts `owner`, `tenant`, and `manager` personas.

**Architectural constraint — the Repository seam:** screens never read backend
code or seed data directly; they call hooks backed by a `Repository` interface
with a demo implementation and a Supabase implementation. Any new domain data
must go through it. Demo-only flourishes are gated so fabricated numbers can
never render in the real product, and a fresh community must render honest
empty states everywhere rather than sample content.

**Undecided (do not resolve by inventing):**
- Whether board operations eventually becomes a separate desktop-shaped
  product ("Tier 2") or stays a surface within this one. Evidence from the
  first pilot is meant to settle it.
- Payments are not implemented. Dues are displayed, not collected; a real
  payment path is a planned fast-follow.
- Notifications (email/push) do not exist yet.
- The app currently renders inside a fixed 393×830 phone frame on every
  viewport, including desktop. Whether board surfaces get a real desktop
  layout is an open decision, not a settled constraint.

## Brand Commitments

- **Name:** Pavilion. Community instances are referred to by their own name
  (the demo community is Juniper Ridge).
- **Voice:** plain, warm, and direct. Short declarative sentences. It states
  what happened and what it costs without euphemism or bureaucratic register —
  "Paid. Done in two taps.", "The HOA, in the open", "Every dollar, vote, and
  decision — visible to every household." It never manufactures urgency and
  never uses officious HOA-speak.
- **Honesty rule (binding):** the product does not display fabricated data,
  invented certainty, or claims it cannot support. Where it does not know, it
  says so and offers a real next step — the assistant answers only from the
  community's actual documents and declines to guess rather than inventing a
  rule.
- **Existing visual system is incumbent and binding** unless a redesign is
  explicitly requested: warm earth tones (navy, cream, ember, sage, gold), a
  serif display face against a sans body, and per-community accent theming.

## Evidence on Hand

- Working product and presenter demo built from one codebase, deployed to
  separate hosts; a separate marketing site exists.
- Supabase backend with row-level security, a migration history, and a live
  development project.
- 56 passing tests; clean type-check and production build.
- **Absences future work must not paper over:** there is no pilot community
  live yet and no real resident usage data. There are no customers,
  testimonials, case studies, press, benchmarks, or pricing. Nothing may cite
  adoption, satisfaction, savings, or community counts.

## Product Principles

1. **Transparency is the product.** When a choice is between disclosing
   something and simplifying it away, disclose it. Itemization, quorum math,
   and decision reasoning are the value, not clutter.
2. **Never fabricate.** An honest empty state beats a plausible number. This
   binds copy, sample data, and the assistant equally.
3. **Residents did not sign up for software.** Optimize for short, phone-sized,
   event-triggered sessions. Anything that requires sustained attention has
   failed a resident and belongs to the board surface.
4. **Volunteers, not professionals.** Board tooling assumes no training, no
   accounting background, and no time. It must be usable by whoever got
   elected.
5. **The community's documents are the authority.** The product surfaces,
   cites, and links governing rules — it does not become a competing source of
   truth about them.

## Accessibility & Inclusion

**Committed standard: WCAG 2.2 AA**, plus the existing large-type toggle as a
first-class product feature (`largeType` in the store, exposed in profile
settings).

This is a product for every adult in a community regardless of age, vision, or
technical confidence — an HOA cannot choose its residents. Contrast, focus
states, keyboard access, and target sizes are held to AA across both the
resident and board surfaces.
