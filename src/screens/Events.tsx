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
  ...Array.from({ length: 3 }, () => ({ label: '', dot: false, bg: 'transparent', color: '#5B554A' })),
  ...Array.from({ length: 31 }, (_, i) => {
    const d = i + 1;
    return {
      label: String(d),
      dot: !!DOTS[d],
      bg: d === 1 ? '#1A3352' : 'transparent',
      color: d === 1 ? '#F5F0E6' : '#5B554A',
    };
  }),
];

function RsvpButton({ going, onToggle }: { going: boolean; onToggle: () => void }) {
  return going ? (
    <button
      type="button"
      onClick={onToggle}
      className="border-none text-white rounded-full text-xs font-extrabold cursor-pointer font-sans flex-shrink-0"
      style={{ background: '#2A9D5C', padding: '8px 13px' }}
    >
      Going ✓
    </button>
  ) : (
    <button
      type="button"
      onClick={onToggle}
      className="border-none bg-navy text-cream rounded-full text-xs font-extrabold cursor-pointer font-sans flex-shrink-0"
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
      <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
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

  const cardStyle = { background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: '14px 15px' } as const;

  return (
    <div
      data-screen-label="Events"
      className="pav-scroll absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: '#F5F0E6', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ eventsOpen: false })} />
      <h1 className="m-0 mb-1 font-serif font-normal text-[26px] text-navy">July at the Ridge</h1>
      <p className="m-0 mb-3.5 text-[13px] font-semibold" style={{ color: '#7A7365' }}>
        4 events · dots mark the days
      </p>

      {/* Calendar */}
      <div
        style={{
          background: '#FFFEFA',
          border: '1px solid rgba(26,51,82,0.08)',
          borderRadius: 18,
          padding: 14,
          marginBottom: 16,
          
        }}
      >
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-center text-[9.5px] font-extrabold" style={{ color: '#A39B8B' }}>
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
              {c.dot && <span className="w-[5px] h-[5px] rounded-full" style={{ background: '#E06A3E' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Taco cart */}
        <div className="flex items-center gap-3" style={cardStyle}>
          <EventIcon bg="#FBEDE4" icon="ph-fill ph-storefront" color="#C75A31" />
          <EventTitle title="Taco cart · today 5–8 PM" sub={`${tacoGoing} going · clubhouse forecourt`} />
          <RsvpButton going={state.rsvpFood} onToggle={() => set({ rsvpFood: !state.rsvpFood })} />
        </div>

        {/* Movie */}
        <div style={cardStyle}>
          <div className="flex items-center gap-3 mb-[11px]">
            <EventIcon bg="#FBF3E0" icon="ph-fill ph-popcorn" color="#D9A441" />
            <EventTitle title="Movie on the lawn · Sat, dusk" sub={`${movieGoing} going · The Green`} />
            <RsvpButton going={state.rsvpMovie} onToggle={() => set({ rsvpMovie: !state.rsvpMovie })} />
          </div>
          <p className="m-0 mb-[7px] text-[10.5px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: '#8A8375' }}>
            Volunteer slots
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <PhIcon name="ph-fill ph-check-circle" size={14} color="#2A9D5C" />
              <span className="flex-1 text-xs font-bold" style={{ color: '#5B554A' }}>
                Blankets &amp; chairs
              </span>
              <span className="text-[11px] font-bold" style={{ color: '#A39B8B' }}>
                Filled
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PhIcon name="ph ph-circle" size={14} color="#A39B8B" />
              <span className="flex-1 text-xs font-bold" style={{ color: '#5B554A' }}>
                Popcorn duty · 2 of 3
              </span>
              {state.volPopcorn ? (
                <span className="text-[11px] font-bold" style={{ color: '#2A9D5C' }}>
                  You&apos;re in ✓
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => set({ volPopcorn: true })}
                  className="bg-transparent text-navy rounded-full text-[11px] font-extrabold cursor-pointer font-sans"
                  style={{ border: '1.5px solid rgba(26,51,82,0.15)', padding: '4px 10px' }}
                >
                  Sign up
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <PhIcon name="ph-fill ph-check-circle" size={14} color="#2A9D5C" />
              <span className="flex-1 text-xs font-bold" style={{ color: '#5B554A' }}>
                Projector &amp; screen
              </span>
              <span className="text-[11px] font-bold" style={{ color: '#A39B8B' }}>
                Filled
              </span>
            </div>
          </div>
        </div>

        {/* Annual meeting */}
        <div onClick={() => set({ meetingOpen: true })} className="flex items-center gap-3 cursor-pointer" style={cardStyle}>
          <EventIcon bg="#EAF3FD" icon="ph-fill ph-users-four" color="#3A73B5" />
          <EventTitle title="Annual meeting · Tue Jul 15, 7 PM" sub="Clubhouse + Zoom · 2 board seats open" />
          <span className="text-[12.5px] font-extrabold flex-shrink-0" style={{ color: '#C75A31' }}>
            Preview →
          </span>
        </div>

        {/* Pool party */}
        <div className="flex items-center gap-3" style={cardStyle}>
          <EventIcon bg="#EAF3FD" icon="ph-fill ph-swimming-pool" color="#4A90E2" />
          <EventTitle title="Pool party & potluck · Sun Jul 19, 1 PM" sub="Pool deck · bring a dish" />
          <RsvpButton going={state.rsvpPool} onToggle={() => set({ rsvpPool: !state.rsvpPool })} />
        </div>
      </div>
    </div>
  );
}
