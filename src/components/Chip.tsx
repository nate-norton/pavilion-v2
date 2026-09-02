import type { ReactNode } from 'react';

export interface ChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  /** 'sm' (default) = existing py-1.5; 'md' = prototype's 8px/14px padding used by request sheets. */
  size?: 'sm' | 'md';
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'px-3.5 py-1.5',
  md: 'px-3.5 py-2',
};

/** Pill filter chip. Active = navy bg/cream text; inactive = paper bg/bark text. */
export function Chip({ label, active, onClick, icon, size = 'sm' }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        `inline-flex items-center gap-1.5 rounded-full ${SIZE_CLASSES[size]} text-[12.5px] font-extrabold font-sans cursor-pointer ` +
        (active ? 'bg-skydeep text-mist border-0' : 'bg-paper text-slatedark border')
      }
      style={active ? undefined : { borderColor: 'rgb(var(--navy) / 0.12)', borderWidth: 1 }}
    >
      {icon}
      {label}
    </button>
  );
}
