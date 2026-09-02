import { useState } from 'react';
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
import { EmptyState } from '../components/EmptyState';
import { PhIcon } from '../components/PhIcon';
import { ThemeProvider } from '../theme/ThemeProvider';
import { BRAND_THEMES, brandTokens } from '../theme/themes';

/** Token groups — kept in sync with the :root definitions in src/index.css. */
const RAW = ['navy', 'mist', 'paper', 'skyborder', 'mistpale', 'sunset', 'accent', 'accenttint', 'peach', 'sage', 'mint', 'sagedark', 'gold', 'goldpale', 'golddark', 'sky', 'skydeep', 'skypale', 'ink', 'slate', 'slatelight', 'slatedark', 'slatedeep', 'red'];
const EXTENDED = ['skyrule', 'skyline', 'slatepale', 'slatedim', 'slatefaint', 'mistlight', 'mistdim', 'misttint', 'skywash', 'skyedge', 'sunsetpale', 'sunsetdim', 'sagelight', 'sagebright', 'sagemid', 'sagepale', 'sagemist', 'sagesoft', 'sagecool', 'sunsetbright', 'brown', 'reddeep', 'skytint', 'skydark', 'violet'];
const SEMANTIC = ['color-bg', 'color-surface', 'color-primary', 'color-text', 'color-muted', 'color-accent', 'color-danger', 'color-success'];

function Swatch({ name }: { name: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-12 rounded-lg"
        style={{ background: `rgb(var(--${name}))`, border: '1px solid rgb(var(--navy) / 0.1)' }}
      />
      <span className="text-[10.5px] font-bold text-slatedark font-mono">--{name}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="m-0 mb-4 font-serif text-[20px] text-navy">{title}</h2>
      {children}
    </section>
  );
}

export function Gallery() {
  const [seg, setSeg] = useState('feed');
  const [tog1, setTog1] = useState(true);
  const [tog2, setTog2] = useState(false);
  const [brand, setBrand] = useState('juniper');

  return (
    <ThemeProvider tokens={brandTokens(brand)} className="min-h-dvh" style={{ background: 'rgb(var(--mist))' }}>
      <div className="max-w-[880px] mx-auto px-6 py-10">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="m-0 font-serif text-[30px] text-navy">Pavilion — Kitchen Sink</h1>
          <a href="/" className="text-[13px] font-bold text-accent no-underline">← Back to app</a>
        </div>
        <p className="m-0 mb-8 text-[13.5px] text-slatedeep font-semibold">
          Every design token and UI primitive in one place. Switch the community brand to see tokens recolor the whole page live.
        </p>

        <div className="flex gap-1.5 mb-10">
          {BRAND_THEMES.map((t) => (
            <button
              key={t.key}
              onClick={() => setBrand(t.key)}
              className="rounded-full px-3.5 py-2 text-[12px] font-bold cursor-pointer border-none"
              style={{
                background: brand === t.key ? 'rgb(var(--accent))' : 'rgb(var(--navy) / 0.06)',
                color: brand === t.key ? 'rgb(var(--paper))' : 'rgb(var(--navy))',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Section title="Semantic tokens">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {SEMANTIC.map((n) => <Swatch key={n} name={n} />)}
          </div>
        </Section>

        <Section title="Raw palette">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {RAW.map((n) => <Swatch key={n} name={n} />)}
          </div>
        </Section>

        <Section title="Extended tokens (one-offs — candidates to collapse)">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {EXTENDED.map((n) => <Swatch key={n} name={n} />)}
          </div>
        </Section>

        <Section title="Avatars">
          <div className="flex items-end gap-4">
            <Avatar initial="A" color="rgb(var(--skydeep))" size={26} />
            <Avatar initial="M" color="rgb(var(--accent))" size={36} />
            <Avatar initial="R" color="rgb(var(--sage))" size={48} />
            <Avatar initial="D" color="rgb(var(--sky))" size={64} />
          </div>
        </Section>

        <Section title="Chips">
          <div className="flex flex-wrap gap-2">
            <Chip label="Inactive" />
            <Chip label="Active" active />
            <Chip label="With icon" icon={<PhIcon name="ph-fill ph-sparkle" size={12} color="rgb(var(--accent))" />} />
            <Chip label="Medium" size="md" active />
          </div>
        </Section>

        <Section title="Pills">
          <div className="flex flex-wrap gap-2">
            <Pill label="Paid" bg="rgb(var(--mint))" color="rgb(var(--sagedark))" />
            <Pill label="Due Jul 3" bg="rgb(var(--goldpale))" color="rgb(var(--golddark))" />
            <Pill label="Shoutout" bg="rgb(var(--accenttint))" color="rgb(var(--accent))" />
            <Pill label="Board" bg="rgb(var(--skypale))" color="rgb(var(--skydeep))" />
          </div>
        </Section>

        <Section title="Progress bars">
          <div className="flex flex-col gap-3 max-w-[420px]">
            <ProgressBar pct={35} />
            <ProgressBar pct={64} color="rgb(var(--sage))" track="rgb(var(--sage) / 0.15)" />
            <ProgressBar pct={82} gradient />
          </div>
        </Section>

        <Section title="Segmented control">
          <div className="max-w-[420px] flex flex-col gap-3">
            <SegmentedControl
              options={[{ key: 'feed', label: 'Feed' }, { key: 'groups', label: 'Groups' }, { key: 'people', label: 'People' }]}
              value={seg}
              onChange={setSeg}
              variant="light"
            />
            <SegmentedControl
              options={[{ key: 'feed', label: 'Feed' }, { key: 'groups', label: 'Groups' }, { key: 'people', label: 'People' }]}
              value={seg}
              onChange={setSeg}
              variant="dark"
            />
          </div>
        </Section>

        <Section title="Status timeline">
          <div className="max-w-[420px]">
            <StatusTimeline steps={[
              { label: 'Submitted', state: 'done' },
              { label: 'Board review', state: 'active' },
              { label: 'Decision', state: 'pending' },
            ]} />
          </div>
        </Section>

        <Section title="Toggles">
          <div className="flex items-center gap-6">
            <Toggle on={tog1} onToggle={() => setTog1((v) => !v)} size="sm" label="Example switch, small" />
            <Toggle on={tog2} onToggle={() => setTog2((v) => !v)} size="lg" label="Example switch, large" />
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap gap-3">
            <button className="border-none rounded-2xl px-5 py-3 text-[14px] font-extrabold text-white cursor-pointer" style={{ background: 'rgb(var(--sunset))' }}>Primary CTA</button>
            <button className="rounded-2xl px-5 py-3 text-[14px] font-extrabold cursor-pointer" style={{ background: 'rgb(var(--skydeep))', color: 'rgb(var(--mist))', border: 'none' }}>Navy</button>
            <button className="rounded-2xl px-5 py-3 text-[14px] font-extrabold cursor-pointer bg-transparent" style={{ border: '1.5px solid rgb(var(--sagedark) / 0.35)', color: 'rgb(var(--sagedark))' }}>Ghost</button>
          </div>
        </Section>

        <Section title="Empty states">
          {/* Both roles side by side — the pair is the point: the same absence
              reads as a wait for a resident and as a door for the board. */}
          <div className="flex flex-col gap-4 max-w-[420px]">
            <EmptyState
              icon="ph-fill ph-calendar-check"
              title="No amenities set up yet"
              body="When your board adds the clubhouse, pool, or courts, you’ll book them here."
            />
            <EmptyState
              icon="ph-fill ph-calendar-check"
              title="No amenities set up yet"
              body="Add the clubhouse, pool, or courts and neighbors book them themselves — no more sign-up sheet on the door."
              actionLabel="Add an amenity"
              onAction={() => {}}
            />
            {/* The three states an absence can actually mean. */}
            <EmptyState icon="ph-fill ph-calendar-check" title="No amenities set up yet" body="…" status="loading" />
            <EmptyState icon="ph-fill ph-calendar-check" title="No amenities set up yet" body="…" status="error" />
          </div>
        </Section>

        <Section title="Misc">
          <div className="flex flex-col gap-4 max-w-[420px]">
            <BackButton onClick={() => {}} />
            <TypingDots />
            <PhotoPlaceholder label="photo placeholder" height={88} />
          </div>
        </Section>
      </div>
    </ThemeProvider>
  );
}
