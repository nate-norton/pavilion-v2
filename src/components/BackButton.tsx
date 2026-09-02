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
        'border-none bg-transparent flex items-center gap-[5px] text-[13px] font-extrabold cursor-pointer font-sans px-0 ' +
        (className ?? 'mb-3.5')
      }
      // 44px target (WCAG 2.5.8 comfortably) without moving the text: the
      // vertical padding is cancelled by a matching negative margin.
      style={{ color: 'rgb(var(--slate))', minHeight: 44, paddingTop: 12, paddingBottom: 12, marginTop: -12, marginBottom: undefined }}
    >
      <PhIcon name="ph-bold ph-arrow-left" size={14} />
      {label}
    </button>
  );
}
