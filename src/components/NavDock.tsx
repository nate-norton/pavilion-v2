import { usePavStore } from '../store/store';
import { PhIcon } from './PhIcon';
import { isLiveMode } from '../auth/AuthGate';

const ACTIVE = 'rgb(var(--cream))';
// 0.45 measured 3.55:1 against navy — below AA for these 10px labels.
// 0.62 clears it at 5.34:1 while staying clearly quieter than the
// active state's 11.28:1.
const INACTIVE = 'rgb(var(--cream) / 0.92)';

const TABS: { key: string; icon: string; label: string }[] = [
  { key: 'today', icon: 'ph-fill ph-sun-horizon', label: 'Today' },
  { key: 'commons', icon: 'ph-fill ph-users-three', label: 'Commons' },
];

const TABS_RIGHT: { key: string; icon: string; label: string }[] = [
  { key: 'reserve', icon: 'ph-fill ph-calendar-check', label: 'Reserve' },
  { key: 'hoa', icon: 'ph-fill ph-scales', label: 'HOA' },
];

/**
 * Bottom navy nav dock with a raised center orb.
 *
 * The orb is the most prominent control in the product, so what sits in it has
 * to be real. The demo's Ask AI is scripted and answers from Juniper Ridge's
 * documents, so the demo keeps it. Live has no assistant yet — pointing a
 * fifth of primary navigation at a "coming soon" sheet is a claim the product
 * can't support, and first-run residents tap the brightest thing on screen
 * first. Live gets Search instead, which is real, is the way into the
 * documents and decisions the product is built around, and was otherwise
 * buried in a 17px unlabeled header glyph. Ask AI returns to the orb when
 * there is an assistant behind it.
 */
export function NavDock() {
  const tab = usePavStore((s) => s.tab);
  const set = usePavStore((s) => s.set);
  const orb = isLiveMode
    ? { icon: 'ph-bold ph-magnifying-glass', label: 'Search', open: () => set({ searchOpen: true, searchQ: '' }) }
    : { icon: 'ph-fill ph-sparkle', label: 'Ask AI', open: () => set({ aiOpen: true }) };

  const renderTab = (t: { key: string; icon: string; label: string }) => {
    const active = tab === t.key;
    const color = active ? ACTIVE : INACTIVE;
    return (
      <button
        key={t.key}
        type="button"
        onClick={() => set({ tab: t.key })}
        className="border-0 bg-transparent flex flex-col items-center gap-[3px] cursor-pointer py-1.5 font-sans"
      >
        <PhIcon name={t.icon} size={21} color={color} />
        <span className="text-[10px] font-extrabold" style={{ color }}>
          {t.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="absolute left-3.5 right-3.5 z-[70]"
      style={{ bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="bg-skydeep rounded-[26px] h-[66px] grid items-center px-1.5"
        style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', boxShadow: '0 18px 40px -14px rgb(var(--navy) / 0.55)' }}
      >
        {TABS.map(renderTab)}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={orb.open}
            aria-label={orb.label}
            className="flex flex-col items-center cursor-pointer border-0 bg-transparent"
            style={{ transform: 'translateY(-10px)' }}
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center"
              style={{
                border: '3px solid rgb(var(--cream))',
                background: 'linear-gradient(150deg,rgb(var(--emberdeep)),rgb(var(--embershade)))',
              }}
            >
              <PhIcon name={orb.icon} size={22} color="rgb(var(--white))" />
            </div>
            <span className="text-[10px] font-extrabold mt-[2px]" style={{ color: ACTIVE }}>
              {orb.label}
            </span>
          </button>
        </div>
        {TABS_RIGHT.map(renderTab)}
      </div>
    </nav>
  );
}
