import { PhIcon } from './PhIcon';

export interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

/** Shared "← Back" button used at the top of secondary screens (line 1554). */
export function BackButton({ onClick, label = 'Back', className }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'border-none bg-transparent flex items-center gap-[5px] text-[13px] font-extrabold cursor-pointer font-sans p-0 ' +
        (className ?? 'mb-3.5')
      }
      style={{ color: 'rgb(var(--slate))' }}
    >
      <PhIcon name="ph-bold ph-arrow-left" size={14} />
      {label}
    </button>
  );
}
