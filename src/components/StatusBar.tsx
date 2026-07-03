import { PhIcon } from './PhIcon';

/** Fake iOS-style status bar (prototype lines 72-80). Decorative, non-interactive. */
export function StatusBar() {
  return (
    <div
      className="absolute top-0 left-0 right-0 h-12 z-[100] flex items-center justify-between px-7 pointer-events-none"
      aria-hidden="true"
    >
      <span className="font-extrabold text-[15px] text-navy tracking-tight">9:41</span>
      <div className="flex items-center gap-1.5 text-navy text-[15px]">
        <PhIcon name="ph-fill ph-cell-signal-full" size={15} />
        <PhIcon name="ph-fill ph-wifi-high" size={15} />
        <PhIcon name="ph-fill ph-battery-full" size={18} />
      </div>
    </div>
  );
}
