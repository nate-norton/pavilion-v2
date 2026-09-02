import type { ReactNode } from 'react';
import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';

const DOTS: Record<number, boolean> = { 1: true, 5: true, 15: true, 19: true };

interface CalCell {
  label: string;
  dot: boolean;
  bg: string;
  color: string;
}

// July 2026 mini calendar (Jul 1 = Wednesday) — prototype lines 3190-3194.
const CAL_CELLS: CalCell[] = [
  ...Array.from({ length: 3 }, () => ({ label: '', dot: false, bg: 'transparent', color: 'rgb(var(--bark))' })),
  ...Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    return {
      label: String(d),
      dot: !!DOTS[d],
      bg: d === 1 ? 'rgb(var(--navy))' : 'transparent',
      color: d === 1 ? 'rgb(var(--cream))' : 'rgb(var(--bark))',
    };
  }),
];

function RsvpButton({ going, onToggle }: { going: boolean; onToggle: () => void }) {
  return going ? (
    <button
      type="button"
      onClick={onToggle}
      className="border-none text-white rounded-full text-xs font-extrabold cursor-pointer font-sans flex-shrink-0"
      style={{ background: 'rgb(var(--sagedark))', padding: '8px 13px' }}
    >
      Going ✓
    </button>
  ) : (
    <button
      type="button"
      onClick={onToggle}
      className="border-none bg-emberdeep text-white rounded-full text-xs font-extrabold cursor-pointer font-sans flex-shrink-0"
      style={{ padding: '8px 13px' }}
    >
      RSVP
    </button>
  );
}

function EventIcon({ bg, icon, color }: { bg: string; icon: string; color: string }) {
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
      <PhIcon name={icon} size={19} color={color} />
    </div>
  );
}

function EventTitle({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="flex-1 min-w-0">
      <p className="m-0 mb-px text-[13.5px] font-bold text-navy">{title}</p>
      <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--stone))' }}>
        {sub}
      </p>
    </div>
  );
}

/** Events / July calendar screen — ported from prototype lines 2088-2157. */
export function Events() {
  const state = usePavStore();
  const { set } = state;

  if (!state.eventsOpen) return null;

  const tacoGoing = 12 + (state.rsvpFood ? 1 : 0);
  const movieGoing = 23 + (state.rsvpMovie ? 1 : 0);

  const cardStyle = { background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.08)', borderRadius: 16, padding: '14px 15px' } as const;

  return (
    <div
      data-screen-label="Events"
      className="pav-scroll absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: 'rgb(var(--cream))', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ eventsOpen: false })} />
      <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">July at the Ridge</h1>
      <p className="m-0 mb-3.5 text-[13px] font-semibold" style={{ color: 'rgb(var(--taupe))' }}>
        4 events · dots mark the days
      </p>

      {/* Calendar */}
      <div
        style={{
          background: 'rgb(var(--paper))',
          border: '1px solid rgb(var(--navy) / 0.08)',
          borderRadius: 18,
          padding: 14,
          marginBottom: 16,
          
        }}
      >
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-center text-[9.5px] font-extrabold" style={{ color: 'rgb(var(--stonelight))' }}>
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {CAL_CELLS.map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center gap-0.5 rounded-[9px]"
              style={{ height: 34, background: c.bg }}
            >
              <span className="text-[11.5px] font-extrabold" style={{ color: c.color }}>
                {c.label}
              </span>
              {c.dot && <span className="w-[5px] h-[5px] rounded-full" style={{ background: 'rgb(var(--ember))' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Taco cart */}
        <div className="flex items-center gap-3" style={cardStyle}>
          <EventIcon bg="rgb(var(--blush))" icon="ph-fill ph-storefront" color="rgb(var(--terracotta))" />
          <EventTitle title="Taco cart · today 5–8 PM" sub={`${tacoGoing} going · clubhouse forecourt`} />
          <RsvpButton going={state.rsvpFood} onToggle={() => set({ rsvpFood: !state.rsvpFood })} />
        </div>

        {/* Movie */}
        <div style={cardStyle}>
          <div className="flex items-center gap-3 mb-[11px]">
            <EventIcon bg="rgb(var(--goldpale))" icon="ph-fill ph-popcorn" color="rgb(var(--gold))" />
            <EventTitle title="Movie on the lawn · Sat, dusk" sub={`${movieGoing} going · The Green`} />
            <RsvpButton going={state.rsvpMovie} onToggle={() => set({ rsvpMovie: !state.rsvpMovie })} />
          </div>
          <p className="m-0 mb-[7px] text-[10.5px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--stone))' }}>
            Volunteer slots
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sage))" />
              <span className="flex-1 text-xs font-bold" style={{ color: 'rgb(var(--bark))' }}>
                Blankets &amp; chairs
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--stonelight))' }}>
                Filled
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PhIcon name="ph ph-circle" size={14} color="rgb(var(--stonelight))" />
              <span className="flex-1 text-xs font-bold" style={{ color: 'rgb(var(--bark))' }}>
                Popcorn duty · 2 of 3
              </span>
              {state.volPopcorn ? (
                <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--sagedark))' }}>
                  You&apos;re in ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => set({ volPopcorn: true })}
                  className="bg-transparent text-navy rounded-full text-[11px] font-extrabold cursor-pointer font-sans"
                  style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', padding: '4px 10px' }}
                >
                  Sign up
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sage))" />
              <span className="flex-1 text-xs font-bold" style={{ color: 'rgb(var(--bark))' }}>
                Projector &amp; screen
              </span>
              <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--stonelight))' }}>
                Filled
              </span>
            </div>
          </div>
        </div>

        {/* Annual meeting */}
        <button type="button" onClick={() => set({ meetingOpen: true })} className="w-full flex items-center gap-3 cursor-pointer border-none bg-transparent text-left font-sans" style={cardStyle}>
          <EventIcon bg="rgb(var(--skypale))" icon="ph-fill ph-users-four" color="rgb(var(--skydeep))" />
          <EventTitle title="Annual meeting · Tue Jul 15, 7 PM" sub="Clubhouse + Zoom · 2 board seats open" />
          <span className="text-[12.5px] font-extrabold flex-shrink-0" style={{ color: 'rgb(var(--terracotta))' }}>
            Preview →
          </span>
        </button>

        {/* Pool party */}
        <div className="flex items-center gap-3" style={cardStyle}>
          <EventIcon bg="rgb(var(--skypale))" icon="ph-fill ph-swimming-pool" color="rgb(var(--sky))" />
          <EventTitle title="Pool party & potluck · Sun Jul 19, 1 PM" sub="Pool deck · bring a dish" />
          <RsvpButton going={state.rsvpPool} onToggle={() => set({ rsvpPool: !state.rsvpPool })} />
        </div>
      </div>
    </div>
  );
}
