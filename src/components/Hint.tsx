import { useState } from 'react';
import { PhIcon } from './PhIcon';

/**
 * Inline explainer for the handful of HOA terms that carry real consequence.
 *
 * PRODUCT.md describes board members as volunteers with no training and
 * residents as people who did not choose this software — and live mode ships
 * with no help surface at all, because the AI that was meant to be the help
 * says "coming soon". This is the cheap stand-in: an explanation attached to
 * the exact decision it affects, rather than a help centre nobody opens.
 *
 * Collapsed by default so it costs an experienced user nothing.
 */
/**
 * `onDark` is for the navy vote card: the trigger's default --slate reads at
 * 1.9:1 there, so the label and icon flip to cream.
 */
export function Hint({ label, children, onDark }: { label: string; children: React.ReactNode; onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const triggerColor = onDark ? 'rgb(var(--mist))' : 'rgb(var(--slate))';
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center gap-1 border-none bg-transparent px-0 py-1.5 cursor-pointer font-sans"
        // 44px target without moving the label: padding cancelled by margin.
        style={{ minHeight: 44, paddingTop: 10, paddingBottom: 10, marginTop: -10, marginBottom: -10 }}
      >
        <PhIcon name="ph-fill ph-info" size={12} color={triggerColor} />
        <span className="text-[11.5px] font-bold" style={{ color: triggerColor }}>{label}</span>
      </button>
      {open && (
        <p
          className="m-0 mt-1.5 text-[12px] font-semibold leading-[1.5] animate-fadeup"
          style={{
            color: 'rgb(var(--slatedark))',
            background: 'rgb(var(--mistpale))',
            border: '1px solid rgb(var(--navy) / 0.08)',
            borderRadius: 11,
            padding: '9px 11px',
          }}
        >
          {children}
        </p>
      )}
    </div>
  );
}
