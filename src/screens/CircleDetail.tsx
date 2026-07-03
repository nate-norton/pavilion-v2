import { BackButton } from '../components/BackButton';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';

const AVATARS = [
  { initial: 'R', bg: '#C75A31', color: '#fff' },
  { initial: 'T', bg: '#4A90E2', color: '#fff' },
  { initial: 'P', bg: '#2A9D5C', color: '#fff' },
  { initial: 'A', bg: '#1A3352', color: '#F5F0E6' },
  { initial: '+20', bg: '#EDE6D6', color: '#6E6759' },
];

/** Garden Circle detail screen — ported from prototype lines 2043-2086. */
export function CircleDetail() {
  const state = usePavStore();
  const { set } = state;

  if (!state.circleOpen) return null;

  const gardenGoing = 8 + (state.rsvpGarden ? 1 : 0);

  return (
    <div
      data-screen-label="Garden Circle"
      className="pav-scroll absolute inset-0 z-[76] overflow-y-auto animate-scpop"
      style={{ background: '#F5F0E6', padding: '60px 18px 40px' }}
    >
      <BackButton onClick={() => set({ circleOpen: false })} />
      <div
        className="rounded-[18px] mb-3.5 flex items-center justify-center"
        style={{ height: 96, background: 'repeating-linear-gradient(-45deg,#D5E4D6 0 10px,#DCE9DD 10px 20px)' }}
      >
        <span
          className="font-mono text-[10px] rounded-[5px]"
          style={{ color: '#5F8A6F', background: 'rgba(255,254,250,0.85)', padding: '3px 8px' }}
        >
          photo — the garden in June
        </span>
      </div>
      <div className="flex items-center justify-between gap-2.5 mb-1">
        <h1 className="m-0 font-serif font-normal text-[26px] text-navy">Garden Circle</h1>
        <span className="rounded-full text-[11px] font-extrabold" style={{ background: '#E9F6EE', color: '#228049', padding: '5px 12px' }}>
          Joined ✓
        </span>
      </div>
      <p className="m-0 mb-3 text-[12.5px] font-semibold" style={{ color: '#7A7365' }}>
        24 members · run by Rosa M. · neighbor-led since 2019
      </p>
      <div className="flex items-center mb-4">
        {AVATARS.map((a, i) => (
          <div
            key={a.initial}
            className="w-[30px] h-[30px] rounded-full flex items-center justify-center font-extrabold"
            style={{
              background: a.bg,
              color: a.color,
              border: '2px solid #F5F0E6',
              fontSize: a.initial.length > 1 ? 10 : 11,
              marginLeft: i > 0 ? -8 : 0,
            }}
          >
            {a.initial}
          </div>
        ))}
      </div>

      <div className="bg-navy rounded-[18px] p-4 text-cream mb-3.5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="min-w-0">
            <p className="m-0 mb-[3px] text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.12em', color: '#E8A788' }}>
              Next meetup · Sat, 9 AM
            </p>
            <p className="m-0 mb-[3px] font-serif text-base leading-[1.25]">Work party — plot row 3</p>
            <p className="m-0 text-xs font-semibold" style={{ color: 'rgba(245,240,230,0.65)' }}>
              {gardenGoing} going · gloves provided
            </p>
          </div>
          {state.rsvpGarden ? (
            <button
              type="button"
              onClick={() => set({ rsvpGarden: false })}
              className="border-none text-white rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0 flex items-center gap-[5px]"
              style={{ background: '#2A9D5C', padding: '9px 14px' }}
            >
              <PhIcon name="ph-fill ph-check" size={13} />
              Going
            </button>
          ) : (
            <button
              type="button"
              onClick={() => set({ rsvpGarden: true })}
              className="border-none text-white rounded-full text-[12.5px] font-extrabold cursor-pointer font-sans flex-shrink-0"
              style={{ background: '#E06A3E', padding: '9px 14px' }}
            >
              I&apos;m in
            </button>
          )}
        </div>
      </div>

      <div style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: 15, marginBottom: 10 }}>
        <p className="m-0 mb-1 text-[12.5px] font-extrabold text-navy">Tomato starts — free on the bench by plot 4</p>
        <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
          Garden Circle · 1d · 9 likes
        </p>
      </div>
      <div style={{ background: '#FFFEFA', border: '1px solid rgba(26,51,82,0.08)', borderRadius: 16, padding: 15 }}>
        <p className="m-0 mb-1 text-[12.5px] font-extrabold text-navy">Compost bin how-to (with photos)</p>
        <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
          Rosa M. · 4d · 12 likes
        </p>
      </div>
    </div>
  );
}
