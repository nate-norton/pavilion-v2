import type { CSSProperties } from 'react';

export interface SegmentedOption {
  key: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value: string;
  onChange: (key: string) => void;
  variant?: 'light' | 'dark';
}

/**
 * Sand track with active segment styling per variant:
 * - light (Commons, line 285): active = paper bg, navy text, subtle shadow
 * - dark (Board, line 855): active = navy bg, cream text, no shadow
 */
export function SegmentedControl({ options, value, onChange, variant = 'light' }: SegmentedControlProps) {
  return (
    <div className="grid bg-skyborder rounded-[14px] p-1 gap-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((opt) => {
        const active = opt.key === value;
        const style: CSSProperties = active
          ? variant === 'dark'
            ? { background: 'rgb(var(--skydeep))', color: 'rgb(var(--mist))' }
            : { background: 'rgb(var(--paper))', color: 'rgb(var(--navy))', boxShadow: '0 2px 6px rgb(var(--navy) / 0.1)' }
          : { background: 'transparent', color: 'rgb(var(--slate))' };
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
            className="border-0 rounded-[11px] py-2.5 text-[12.5px] font-extrabold font-sans cursor-pointer"
            style={style}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
