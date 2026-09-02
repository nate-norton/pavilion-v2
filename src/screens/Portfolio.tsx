import { BackButton } from '../components/BackButton';
import { Card } from '../components/Card';
import { PhIcon } from '../components/PhIcon';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { usePavStore } from '../store/store';
import { usePortfolio } from '../data/repo';

/** Manager portfolio screen — ported from prototype lines 2447-2478. */
export function Portfolio() {
  const state = usePavStore();
  const { set } = state;
  const PORTFOLIO = usePortfolio();

  const pfDoors = PORTFOLIO.reduce((a, c) => a + c.doors, 0);
  const pfCollected = pfDoors
    ? Math.round(PORTFOLIO.reduce((a, c) => a + c.collected * c.doors, 0) / pfDoors)
    : 0;
  const pfOpen = PORTFOLIO.reduce((a, c) => a + c.open, 0);

  if (!state.portfolioOpen) return null;

  const closePortfolio = () => set({ portfolioOpen: false });

  return (
    <div
      data-testid="portfolio-screen"
      className="pav-fixed absolute inset-0 z-[79] bg-mist overflow-y-auto pav-scroll animate-scpop"
      style={{ padding: 'calc(60px + var(--pav-chrome-top)) 18px calc(40px + var(--pav-safe-bottom))' }}
    >
      <BackButton onClick={closePortfolio} />
      <h1 className="m-0 mb-1 font-serif font-normal text-[24px] text-navy">Portfolio</h1>
      <p className="m-0 mb-4 text-[13.5px] font-semibold text-slatedeep">
        Cedar Hill Management · 3 communities · {pfDoors} doors
      </p>

      {/* Collection rate leads on chrome; the two counts sit beside it on paper. */}
      <div className="grid grid-cols-3 gap-[9px] mb-4">
        <div className="bg-skydeep rounded-[15px] p-[13px_10px] text-center text-mist">
          <p className="m-0 mb-0.5 font-serif text-[24px] leading-[1.1] tabular-nums">{pfCollected}%</p>
          <p className="m-0 text-[12px] font-semibold" style={{ color: 'rgb(var(--mist) / 0.9)' }}>Collected</p>
        </div>
        <Card padding="none" className="p-[13px_10px] text-center" style={{ borderRadius: 15 }}>
          <p className="m-0 mb-0.5 font-serif text-[24px] leading-[1.1] text-navy tabular-nums">{pfOpen}</p>
          <p className="m-0 text-[12px] font-semibold text-slate">Open items</p>
        </Card>
        <Card padding="none" className="p-[13px_10px] text-center" style={{ borderRadius: 15 }}>
          <p className="m-0 mb-0.5 font-serif text-[24px] leading-[1.1] text-navy tabular-nums">{pfDoors}</p>
          <p className="m-0 text-[12px] font-semibold text-slate">Doors</p>
        </Card>
      </div>

      <div className="flex flex-col gap-2.5">
        {PORTFOLIO.map((c, i) => (
          <Card
            key={c.name}
            elevation="raised"
            onClick={() => set({ activeCommunity: i, portfolioOpen: false, boardMode: true })}
          >
            <div className="flex items-center gap-2.5 mb-[11px]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skypale))' }}>
                <PhIcon name="ph-fill ph-buildings" size={19} color="rgb(var(--skydeep))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[14px] font-bold text-navy">{c.name}</p>
                <p className="m-0 text-[12.5px] font-semibold text-slate">
                  {c.doors} doors · {c.dues}
                </p>
              </div>
              <Pill label={c.open === 0 ? 'All clear' : c.open + ' open'} tone={c.open === 0 ? 'success' : 'warning'} />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1">
                <ProgressBar pct={c.collected} height={8} color={c.tone} track="rgb(var(--skyborder))" />
              </div>
              <span className="text-[12.5px] font-bold flex-shrink-0 text-navy tabular-nums">{c.collected}% collected</span>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-4 mb-0 text-center text-[12.5px] font-semibold text-slate">
        Tap a community to open its board desk.
      </p>
    </div>
  );
}
