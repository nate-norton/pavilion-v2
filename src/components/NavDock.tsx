import { usePavStore } from '../store/store';
import { PhIcon } from './PhIcon';

const ACTIVE = '#F5F0E6';
const INACTIVE = 'rgba(245,240,230,0.45)';

const TABS: { key: string; icon: string; label: string }[] = [
  { key: 'today', icon: 'ph-fill ph-sun-horizon', label: 'Today' },
  { key: 'commons', icon: 'ph-fill ph-users-three', label: 'Commons' },
];

const TABS_RIGHT: { key: string; icon: string; label: string }[] = [
  { key: 'reserve', icon: 'ph-fill ph-calendar-check', label: 'Reserve' },
  { key: 'hoa', icon: 'ph-fill ph-scales', label: 'HOA' },
];

/** Bottom navy nav dock with center Ask AI orb (prototype lines 2537-2562). */
export function NavDock() {
  const tab = usePavStore((s) => s.tab);
  const set = usePavStore((s) => s.set);

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
    <div
      className="absolute left-3.5 right-3.5 z-[70]"
      style={{ bottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="bg-navy rounded-[26px] h-[66px] grid items-center px-1.5"
        style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', boxShadow: '0 18px 40px -14px rgba(26,51,82,0.55)' }}
      >
        {TABS.map(renderTab)}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => set({ aiOpen: true })}
            className="flex flex-col items-center cursor-pointer border-0 bg-transparent"
            style={{ transform: 'translateY(-10px)' }}
          >
            <div
              className="w-[50px] h-[50px] rounded-full flex items-center justify-center"
              style={{
                border: '3px solid #F5F0E6',
                background: 'linear-gradient(150deg,#F97B4B,#C75A31)',
              }}
            >
              <PhIcon name="ph-fill ph-sparkle" size={22} color="#fff" />
            </div>
            <span className="text-[10px] font-extrabold mt-[2px]" style={{ color: ACTIVE }}>
              Ask AI
            </span>
          </button>
        </div>
        {TABS_RIGHT.map(renderTab)}
      </div>
    </div>
  );
}
