import { useEffect, useRef, useState } from 'react';
import { PhIcon } from './PhIcon';
import { onAppToast, type AppToastMessage } from '../lib/errorBus';

const TONES = {
  error: {
    bg: 'rgb(var(--blush))',
    border: 'rgb(var(--terracotta) / 0.35)',
    fg: 'rgb(var(--brown))',
    icon: 'ph-fill ph-warning',
    iconColor: 'rgb(var(--terracotta))',
  },
  success: {
    bg: 'rgb(var(--mint))',
    border: 'rgb(var(--sage) / 0.35)',
    fg: 'rgb(var(--sagedark))',
    icon: 'ph-fill ph-check-circle',
    iconColor: 'rgb(var(--sagedark))',
  },
} as const;

/**
 * Toast: floats above the nav dock, auto-dismisses, tap to close.
 *
 * `role="status"` matters as much as the visuals — a confirmation nobody can
 * hear is only half a confirmation, and this is the channel that tells a
 * screen-reader user their delete or their ballot actually landed.
 */
export function AppToast() {
  const [toast, setToast] = useState<AppToastMessage | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = onAppToast((t) => {
      setToast(t);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setToast(null), 5000);
    });
    return () => { unsub(); if (timer.current) clearTimeout(timer.current); };
  }, []);

  if (!toast) return null;
  const tone = TONES[toast.tone];

  return (
    <button
      type="button"
      onClick={() => setToast(null)}
      aria-label="Dismiss notification"
      className="border-none font-sans bg-transparent text-left absolute left-4 right-4 z-[95] flex items-start gap-2.5 cursor-pointer animate-fadeup"
      style={{
        bottom: 96,
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgb(var(--scrim) / 0.18)',
      }}
    >
      <PhIcon name={tone.icon} size={17} color={tone.iconColor} className="flex-shrink-0 mt-px" />
      {/*
        The live region sits inside the button rather than on it: role="status"
        on a <button> replaces the button role, so assistive tech announced the
        message but lost the "tap to dismiss" affordance entirely.
      */}
      <p
        role="status"
        aria-live="polite"
        className="m-0 flex-1 text-[12.5px] font-bold leading-[1.45]"
        style={{ color: tone.fg }}
      >
        {toast.message}
      </p>
    </button>
  );
}
