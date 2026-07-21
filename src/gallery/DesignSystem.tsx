import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Avatar } from '../components/Avatar';
import { Chip } from '../components/Chip';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { SegmentedControl } from '../components/SegmentedControl';
import { StatusTimeline } from '../components/StatusTimeline';
import { Toggle } from '../components/Toggle';
import { TypingDots } from '../components/TypingDots';
import { PhotoPlaceholder } from '../components/PhotoPlaceholder';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { ThemeProvider } from '../theme/ThemeProvider';
import { BRAND_THEMES, brandTokens } from '../theme/themes';

/*
 * Pavilion Design System — the structured, opinionated companion to the flat
 * Kitchen Sink (/kitchen-sink). Same tokens and primitives, presented as a
 * real system: foundations first (color roles, type scale, spacing, radius,
 * elevation, motion), then components documented with intent and states.
 * Additive — nothing here changes the app or the presenter demo.
 */

// ── Semantic color roles: the intent-based aliases screens should prefer ──────
const ROLES: { token: string; role: string; use: string }[] = [
  { token: 'color-bg', role: 'Background', use: 'App canvas behind all surfaces' },
  { token: 'color-surface', role: 'Surface', use: 'Cards, sheets, raised panels' },
  { token: 'color-primary', role: 'Primary', use: 'Primary actions, headings, brand' },
  { token: 'color-text', role: 'Text', use: 'Default body & heading color' },
  { token: 'color-muted', role: 'Muted', use: 'Secondary text, captions, hints' },
  { token: 'color-accent', role: 'Accent', use: 'Emphasis, CTAs, active states' },
  { token: 'color-success', role: 'Success', use: 'Paid, approved, positive status' },
  { token: 'color-danger', role: 'Danger', use: 'Errors, overdue, destructive' },
];

// ── Core palette: the named ramp designers reach for by name ──────────────────
const CORE = ['navy', 'cream', 'paper', 'sand', 'ember', 'terracotta', 'sage', 'sagedark', 'gold', 'golddark', 'sky', 'skydeep', 'ink', 'stone', 'bark', 'taupe', 'red', 'mint', 'blush', 'goldpale', 'skypale', 'peach'];

// ── Extended one-offs: tokenized inline literals, candidates to collapse ───────
const EXTENDED = ['sandpale', 'sanddim', 'taupepale', 'taupedim', 'claypale', 'claygray', 'stonegray', 'barkgray', 'creamlight', 'creamdim', 'creamtint', 'creamsand', 'sandtint', 'sanddeep', 'sandwarm', 'blushpale', 'blushdim', 'sagegray', 'sagelight', 'sagebright', 'sagemid', 'sagepale', 'sagetint', 'sagewash', 'sagemist', 'sagesoft', 'sagecool', 'emberbright', 'brown', 'reddeep', 'goldmid', 'skytint', 'skydark', 'violet'];

// ── Type scale: curated from real screen usage (serif display, sans body) ─────
const TYPE_SCALE: { name: string; px: number; family: 'serif' | 'sans'; weight: number; sample: string }[] = [
  { name: 'Display', px: 30, family: 'serif', weight: 400, sample: 'Good morning, Ada' },
  { name: 'Title', px: 20, family: 'serif', weight: 400, sample: 'Your community' },
  { name: 'Heading', px: 17, family: 'serif', weight: 400, sample: 'This week at the pool' },
  { name: 'Body', px: 14, family: 'sans', weight: 600, sample: 'The quick brown fox jumps over the lazy dog.' },
  { name: 'Body small', px: 13, family: 'sans', weight: 600, sample: 'Secondary copy and list rows sit here.' },
  { name: 'Caption', px: 12, family: 'sans', weight: 700, sample: 'META · LABELS · TIMESTAMPS' },
  { name: 'Micro', px: 10.5, family: 'sans', weight: 700, sample: 'Fine print & token labels' },
];

const WEIGHTS = [
  { w: 400, label: 'Regular' },
  { w: 600, label: 'Semibold' },
  { w: 700, label: 'Bold' },
  { w: 800, label: 'Extrabold' },
];

// ── Space & radius scales observed across the app ─────────────────────────────
const SPACE = [2, 4, 6, 8, 12, 16, 20, 24];
const RADIUS = [
  { name: 'sm', px: 8 },
  { name: 'md', px: 11 },
  { name: 'lg', px: 14 },
  { name: 'xl', px: 16 },
  { name: '2xl', px: 20 },
  { name: 'full', px: 999 },
];

const ELEVATION = [
  { name: 'Flat', shadow: 'none', note: 'Inline, on-canvas' },
  { name: 'Card', shadow: '0 2px 8px rgb(var(--navy) / 0.08)', note: 'Hover lift, cards' },
  { name: 'Raised', shadow: '0 2px 6px rgb(var(--navy) / 0.1)', note: 'Active segment, chips' },
  { name: 'Sheet', shadow: '0 -8px 30px rgb(var(--shadow) / 0.18)', note: 'Bottom sheets' },
];

const MOTION = [
  { name: 'fadeup', dur: '0.30s', note: 'Content enters — cards, rows' },
  { name: 'sheetup', dur: '0.32s', note: 'Bottom sheet rises' },
  { name: 'slideleft', dur: '0.30s', note: 'Forward navigation' },
  { name: 'heartpop', dur: '0.35s', note: 'Like / reaction pop' },
  { name: 'msgbubble', dur: '0.28s', note: 'Chat message appears' },
];

const ICON_SAMPLE = ['house-line', 'users-three', 'calendar-check', 'chat-circle', 'sparkle', 'shield-check', 'swimming-pool', 'gavel', 'receipt', 'bell', 'map-trifold', 'heart'];

/** Reads the resolved rgb triplet of a CSS var so swatches show real values. */
function useTokenRgb(token: string) {
  const ref = useRef<HTMLDivElement>(null);
  const [rgb, setRgb] = useState('');
  useEffect(() => {
    if (!ref.current) return;
    const raw = getComputedStyle(ref.current).getPropertyValue(`--${token}`).trim();
    setRgb(raw ? raw.replace(/\s+/g, ', ') : '');
  }, [token]);
  return { ref, rgb };
}

function Swatch({ token, label }: { token: string; label?: string }) {
  const { ref, rgb } = useTokenRgb(token);
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <div className="h-14 rounded-lg" style={{ background: `rgb(var(--${token}))`, boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.1)' }} />
      <span className="text-[11px] font-extrabold text-navy font-mono leading-tight">--{label ?? token}</span>
      {rgb && <span className="text-[10px] text-taupe font-mono leading-tight">{rgb}</span>}
    </div>
  );
}

function RoleRow({ token, role, use }: { token: string; role: string; use: string }) {
  const { ref, rgb } = useTokenRgb(token);
  return (
    <div ref={ref} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.07)' }}>
      <div className="w-10 h-10 rounded-lg flex-shrink-0" style={{ background: `rgb(var(--${token}))`, boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.12)' }} />
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-extrabold text-navy">{role}</div>
        <div className="text-[12px] text-taupe font-semibold">{use}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[11px] font-extrabold text-bark font-mono">--{token}</div>
        {rgb && <div className="text-[10px] text-taupe font-mono">{rgb}</div>}
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="mb-12 scroll-mt-6" id={title.toLowerCase().replace(/\s+/g, '-')}>
      <h2 className="m-0 mb-1 font-serif text-[22px] text-navy">{title}</h2>
      {sub && <p className="m-0 mb-5 text-[13px] text-taupe font-semibold max-w-[560px]">{sub}</p>}
      {!sub && <div className="mb-5" />}
      {children}
    </section>
  );
}

/** A component demo cell with a caption describing when to use it. */
function Spec({ name, use, children }: { name: string; use: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgb(var(--paper))', boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.08)' }}>
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <span className="text-[13.5px] font-extrabold text-navy">{name}</span>
        <span className="text-[11.5px] text-taupe font-semibold text-right">{use}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const btnBase = 'border-0 rounded-2xl px-5 py-3 text-[14px] font-extrabold font-sans cursor-pointer';

export function DesignSystem() {
  const [seg, setSeg] = useState('feed');
  const [tog1, setTog1] = useState(true);
  const [tog2, setTog2] = useState(false);
  const [brand, setBrand] = useState('juniper');

  return (
    <ThemeProvider tokens={brandTokens(brand)} className="min-h-dvh" style={{ background: 'rgb(var(--cream))' }}>
      <div className="max-w-[900px] mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-baseline justify-between mb-2 gap-4">
          <h1 className="m-0 font-serif text-[34px] text-navy leading-none">Pavilion Design System</h1>
          <div className="flex items-center gap-4 flex-shrink-0">
            <a href="/kitchen-sink" className="text-[13px] font-bold text-taupe no-underline">Kitchen Sink</a>
            <a href="/" className="text-[13px] font-bold text-terracotta no-underline">← App</a>
          </div>
        </div>
        <p className="m-0 mb-8 text-[14px] text-bark font-semibold max-w-[620px]">
          The shared visual language for Pavilion — warm earth tones, a serif/sans pairing, and a small
          set of tactile primitives. Foundations first, then components with the intent behind each.
          Switch the community brand to see accent families recolor the whole system live.
        </p>

        {/* Brand switcher */}
        <div className="flex flex-wrap gap-1.5 mb-10">
          {BRAND_THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => setBrand(t.key)}
              className="rounded-full px-3.5 py-2 text-[12px] font-extrabold cursor-pointer border-0"
              style={{
                background: brand === t.key ? 'rgb(var(--terracotta))' : 'rgb(var(--navy) / 0.06)',
                color: brand === t.key ? 'rgb(var(--paper))' : 'rgb(var(--navy))',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-14">
          {[
            { t: 'Warm & human', d: 'Earth tones over stark UI. Cream canvas, ink-navy text, terracotta warmth.' },
            { t: 'Tactile', d: 'Rounded forms, gentle lifts, springy motion. Every tap has feedback.' },
            { t: 'Calm density', d: 'Serif for voice, sans for detail. Generous space, one accent at a time.' },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl p-4" style={{ background: 'rgb(var(--paper))', boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.08)' }}>
              <div className="font-serif text-[16px] text-navy mb-1">{p.t}</div>
              <div className="text-[12.5px] text-taupe font-semibold leading-snug">{p.d}</div>
            </div>
          ))}
        </div>

        {/* ── FOUNDATIONS ────────────────────────────────────────────────── */}
        <div className="text-[12px] font-extrabold tracking-[0.14em] text-terracotta mb-4">FOUNDATIONS</div>

        <Section title="Color roles" sub="Intent-based aliases. Prefer these in screens so a rebrand is a one-file edit.">
          <div className="rounded-2xl px-4 py-1" style={{ background: 'rgb(var(--paper))', boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.08)' }}>
            {ROLES.map((r) => <RoleRow key={r.token} {...r} />)}
          </div>
        </Section>

        <Section title="Core palette" sub="The named ramp. Reach for these by name; alpha via the /opacity modifier (e.g. navy/10).">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {CORE.map((n) => <Swatch key={n} token={n} />)}
          </div>
        </Section>

        <Section title="Extended tokens" sub="One-off literals tokenized at their exact values. Several are near-duplicate drift — candidates to collapse once design signs off.">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
            {EXTENDED.map((n) => <Swatch key={n} token={n} />)}
          </div>
        </Section>

        <Section title="Typography" sub="Young Serif for voice and headings; Nunito Sans for everything functional.">
          <div className="rounded-2xl p-6 flex flex-col gap-4 mb-5" style={{ background: 'rgb(var(--paper))', boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.08)' }}>
            {TYPE_SCALE.map((t) => (
              <div key={t.name} className="flex items-baseline gap-4" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.06)', paddingBottom: 14 }}>
                <div className="w-[104px] flex-shrink-0">
                  <div className="text-[12px] font-extrabold text-navy">{t.name}</div>
                  <div className="text-[10.5px] text-taupe font-mono">{t.family} · {t.px}px · {t.weight}</div>
                </div>
                <div className="flex-1 min-w-0 truncate text-navy" style={{ fontFamily: t.family === 'serif' ? "'Young Serif', serif" : "'Nunito Sans', sans-serif", fontSize: t.px, fontWeight: t.weight }}>
                  {t.sample}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-6">
            {WEIGHTS.map((w) => (
              <div key={w.w} className="flex flex-col">
                <span className="text-[22px] text-navy" style={{ fontWeight: w.w }}>Aa</span>
                <span className="text-[11px] text-taupe font-semibold">{w.label} {w.w}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Spacing" sub="A 2-based scale (Tailwind units). Rows and cards favor 12–16; section gaps 20–24.">
          <div className="flex flex-wrap items-end gap-4">
            {SPACE.map((s) => (
              <div key={s} className="flex flex-col items-center gap-1.5">
                <div style={{ width: s, height: s, background: 'rgb(var(--terracotta))', borderRadius: 3 }} />
                <span className="text-[11px] font-mono text-taupe">{s}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Radius" sub="Rounded is the default. Pills use full; cards 16–20; controls 11–14.">
          <div className="flex flex-wrap gap-4">
            {RADIUS.map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-1.5">
                <div className="w-16 h-16" style={{ background: 'rgb(var(--navy) / 0.08)', boxShadow: 'inset 0 0 0 1.5px rgb(var(--navy) / 0.25)', borderRadius: r.px }} />
                <span className="text-[11px] font-mono text-taupe">{r.name} · {r.px === 999 ? '∞' : r.px}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Elevation" sub="Soft, navy-tinted shadows — never harsh black. Depth signals interactivity and layering.">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ELEVATION.map((e) => (
              <div key={e.name} className="flex flex-col gap-2">
                <div className="h-16 rounded-2xl" style={{ background: 'rgb(var(--paper))', boxShadow: e.shadow === 'none' ? 'inset 0 0 0 1px rgb(var(--navy) / 0.08)' : e.shadow }} />
                <div>
                  <div className="text-[12px] font-extrabold text-navy">{e.name}</div>
                  <div className="text-[11px] text-taupe font-semibold">{e.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Motion" sub="Springy cubic-beziers, short durations. Content eases up; sheets and reactions get a little bounce.">
          <div className="rounded-2xl p-2" style={{ background: 'rgb(var(--paper))', boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.08)' }}>
            {MOTION.map((m) => (
              <div key={m.name} className="flex items-center gap-3 px-3 py-2.5" style={{ borderBottom: '1px solid rgb(var(--navy) / 0.06)' }}>
                <span className="text-[12px] font-extrabold text-navy font-mono w-[92px]">{m.name}</span>
                <span className="text-[11px] text-taupe font-mono w-[52px]">{m.dur}</span>
                <span className="text-[12px] text-bark font-semibold flex-1">{m.note}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── COMPONENTS ─────────────────────────────────────────────────── */}
        <div className="text-[12px] font-extrabold tracking-[0.14em] text-terracotta mb-4 mt-16">COMPONENTS</div>

        <Section title="Buttons">
          <div className="grid grid-cols-1 gap-3">
            <Spec name="Primary" use="One per view — the main action">
              <button className={btnBase + ' text-white'} style={{ background: 'rgb(var(--ember))' }}>Pay dues</button>
            </Spec>
            <Spec name="Secondary" use="Strong but not the hero action">
              <button className={btnBase} style={{ background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}>View details</button>
            </Spec>
            <Spec name="Ghost" use="Low-emphasis, tertiary">
              <button className={btnBase + ' bg-transparent'} style={{ boxShadow: 'inset 0 0 0 1.5px rgb(var(--sagedark) / 0.35)', color: 'rgb(var(--sagedark))' }}>Maybe later</button>
            </Spec>
            <Spec name="Danger" use="Destructive or overdue">
              <button className={btnBase + ' text-white'} style={{ background: 'rgb(var(--red))' }}>Remove</button>
            </Spec>
          </div>
        </Section>

        <Section title="Chips & Pills">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Spec name="Chip" use="Interactive filter — has selected state">
              <Chip label="All" active />
              <Chip label="Events" />
              <Chip label="AI" icon={<PhIcon name="ph-fill ph-sparkle" size={12} color="rgb(var(--terracotta))" />} />
            </Spec>
            <Spec name="Pill" use="Read-only status badge">
              <Pill label="Paid" bg="rgb(var(--mint))" color="rgb(var(--sagedark))" />
              <Pill label="Due Jul 3" bg="rgb(var(--goldpale))" color="rgb(var(--golddark))" />
              <Pill label="Board" bg="rgb(var(--skypale))" color="rgb(var(--skydeep))" />
            </Spec>
          </div>
        </Section>

        <Section title="Selection & input">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Spec name="Segmented control" use="2–4 mutually exclusive views">
              <div className="w-full flex flex-col gap-3">
                <SegmentedControl options={[{ key: 'feed', label: 'Feed' }, { key: 'groups', label: 'Groups' }, { key: 'people', label: 'People' }]} value={seg} onChange={setSeg} variant="light" />
                <SegmentedControl options={[{ key: 'feed', label: 'Feed' }, { key: 'groups', label: 'Groups' }, { key: 'people', label: 'People' }]} value={seg} onChange={setSeg} variant="dark" />
              </div>
            </Spec>
            <Spec name="Toggle" use="Instant on/off setting">
              <Toggle on={tog1} onToggle={() => setTog1((v) => !v)} size="sm" />
              <Toggle on={tog2} onToggle={() => setTog2((v) => !v)} size="lg" />
            </Spec>
          </div>
        </Section>

        <Section title="Status & progress">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Spec name="Progress bar" use="Fundraising, reserves, completion">
              <div className="w-full flex flex-col gap-3">
                <ProgressBar pct={35} />
                <ProgressBar pct={64} color="rgb(var(--sage))" track="rgb(var(--sage) / 0.15)" />
                <ProgressBar pct={82} gradient />
              </div>
            </Spec>
            <Spec name="Status timeline" use="Multi-step review — ARC, violations">
              <div className="w-full">
                <StatusTimeline steps={[{ label: 'Submitted', state: 'done' }, { label: 'Board review', state: 'active' }, { label: 'Decision', state: 'pending' }]} />
              </div>
            </Spec>
          </div>
        </Section>

        <Section title="Identity & media">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Spec name="Avatar" use="People — sized 26 / 36 / 48 / 64">
              <Avatar initial="A" color="rgb(var(--navy))" size={26} />
              <Avatar initial="M" color="rgb(var(--terracotta))" size={36} />
              <Avatar initial="R" color="rgb(var(--sage))" size={48} />
              <Avatar initial="D" color="rgb(var(--sky))" size={64} />
            </Spec>
            <Spec name="Photo placeholder" use="Empty image slot before upload">
              <div className="w-full"><PhotoPlaceholder label="photo placeholder" height={88} /></div>
            </Spec>
          </div>
        </Section>

        <Section title="Feedback & navigation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Spec name="Typing dots" use="AI / chat is composing a reply">
              <TypingDots />
            </Spec>
            <Spec name="Back button" use="Return from a sub-view or sheet">
              <BackButton onClick={() => {}} />
            </Spec>
          </div>
        </Section>

        <Section title="Iconography" sub="Phosphor icons via PhIcon — 'ph-fill' / 'ph-bold' weights. Terracotta for accent, navy for default.">
          <div className="rounded-2xl p-5 flex flex-wrap gap-5" style={{ background: 'rgb(var(--paper))', boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.08)' }}>
            {ICON_SAMPLE.map((n) => (
              <div key={n} className="flex flex-col items-center gap-1.5 w-[64px]">
                <PhIcon name={`ph-fill ph-${n}`} size={26} color="rgb(var(--navy))" />
                <span className="text-[9.5px] text-taupe font-mono text-center leading-tight">{n}</span>
              </div>
            ))}
          </div>
        </Section>

        <footer className="mt-8 pt-6 text-[12px] text-taupe font-semibold" style={{ borderTop: '1px solid rgb(var(--navy) / 0.08)' }}>
          Tokens live in <span className="font-mono text-bark">src/index.css</span> · primitives in{' '}
          <span className="font-mono text-bark">src/components/</span> · the flat reference is the{' '}
          <a href="/kitchen-sink" className="text-terracotta no-underline font-bold">Kitchen Sink</a>.
        </footer>
      </div>
    </ThemeProvider>
  );
}
