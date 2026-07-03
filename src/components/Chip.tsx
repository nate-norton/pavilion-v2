import type { ReactNode } from 'react';

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

/** Pill filter chip. Active = navy bg/cream text; inactive = paper bg/bark text. */
export function Chip({ label, active, onClick, icon }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-extrabold font-sans cursor-pointer ' +
        (active ? 'bg-navy text-cream border-0' : 'bg-paper text-bark border')
      }
      style={active ? undefined : { borderColor: 'rgba(26,51,82,0.12)', borderWidth: 1 }}
    >
      {icon}
      {label}
    </button>
  );
}
