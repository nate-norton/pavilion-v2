import { PhIcon } from '../components/PhIcon';
import { ProgressBar } from '../components/ProgressBar';
import { usePavStore } from '../store/store';
import { PORTFOLIO } from '../data';

const pfDoors = PORTFOLIO.reduce((a, c) => a + c.doors, 0);
const pfCollected = Math.round(
  PORTFOLIO.reduce((a, c) => a + c.collected * c.doors, 0) / pfDoors
);
const pfOpen = PORTFOLIO.reduce((a, c) => a + c.open, 0);

/** Manager portfolio screen — ported from prototype lines 2447-2478. */
export function Portfolio() {
  const state = usePavStore();
  const { set } = state;

  if (!state.portfolioOpen) return null;

  const closePortfolio = () => set({ portfolioOpen: false });

  return (
    <div
      data-testid="portfolio-screen"
      className="absolute inset-0 z-[79] bg-cream overflow-y-auto pav-scroll animate-scpop"
      style={{ padding: '60px 18px 40px' }}
    >
      <button
        onClick={closePortfolio}
        className="border-0 bg-transparent flex items-center gap-[5px] text-[13px] font-extrabold cursor-pointer p-0 mb-3.5"
        style={{ color: '#8A8375' }}
      >
        <PhIcon name="ph-bold ph-arrow-left" size={14} />
        Back
      </button>
      <h1 className="m-0 mb-1 font-serif font-normal text-[26px] text-navy">Portfolio</h1>
      <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: '#7A7365' }}>
        Cedar Hill Management · 3 communities · {pfDoors} doors
      </p>

      <div className="grid grid-cols-3 gap-[9px] mb-4">
        <div className="bg-navy rounded-[15px] p-[13px_10px] text-center text-cream">
          <p className="m-0 mb-0.5 font-serif text-xl">{pfCollected}%</p>
          <p className="m-0 text-[9.5px] font-bold" style={{ color: 'rgba(245,240,230,0.6)', letterSpacing: '0.05em' }}>
            COLLECTED
          </p>
        </div>
        <div className="bg-paper rounded-[15px] p-[13px_10px] text-center" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">{pfOpen}</p>
          <p className="m-0 text-[9.5px] font-bold" style={{ color: '#8A8375', letterSpacing: '0.05em' }}>
            OPEN ITEMS
          </p>
        </div>
        <div className="bg-paper rounded-[15px] p-[13px_10px] text-center" style={{ border: '1px solid rgba(26,51,82,0.08)' }}>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">{pfDoors}</p>
          <p className="m-0 text-[9.5px] font-bold" style={{ color: '#8A8375', letterSpacing: '0.05em' }}>
            DOORS
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {PORTFOLIO.map((c, i) => {
          const openLabel = c.open === 0 ? 'All clear' : c.open + ' open';
          const openColor = c.open === 0 ? '#228049' : '#A87B1F';
          return (
            <div
              key={c.name}
              onClick={() => set({ activeCommunity: i, portfolioOpen: false, boardMode: true })}
              className="bg-paper rounded-[18px] p-4 cursor-pointer"
              style={{ border: '1px solid rgba(26,51,82,0.08)' }}
            >
              <div className="flex items-center gap-2.5 mb-[11px]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-sand">
                  <PhIcon name="ph-fill ph-buildings" size={19} color="#1A3352" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-[14.5px] font-bold text-navy">{c.name}</p>
                  <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
                    {c.doors} doors · {c.dues}
                  </p>
                </div>
                <span className="text-xs font-bold flex-shrink-0" style={{ color: openColor }}>
                  {openLabel}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1">
                  <ProgressBar pct={c.collected} height={8} color={c.tone} track="#EDE6D6" />
                </div>
                <span className="text-[11.5px] font-bold flex-shrink-0 text-navy">{c.collected}% collected</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 mb-0 text-center text-[11.5px] font-bold" style={{ color: '#A39B8B' }}>
        Tap a community to open its board desk.
      </p>
    </div>
  );
}
