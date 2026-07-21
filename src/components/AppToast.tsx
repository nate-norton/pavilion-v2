import { useEffect, useRef, useState } from 'react';
import { PhIcon } from './PhIcon';
import { onAppError } from '../lib/errorBus';

/** Error toast: floats above the nav dock, auto-dismisses, tap to close. */
export function AppToast() {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = onAppError((msg) => {
      setMessage(msg);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setMessage(null), 5000);
    });
    return () => { unsub(); if (timer.current) clearTimeout(timer.current); };
  }, []);

  if (!message) return null;

  return (
    <div
      onClick={() => setMessage(null)}
      className="absolute left-4 right-4 z-[95] flex items-start gap-2.5 cursor-pointer animate-fadeup"
      style={{
        bottom: 96,
        background: 'rgb(var(--blush))',
        border: '1px solid rgb(var(--terracotta) / 0.35)',
        borderRadius: 14,
        padding: '12px 14px',
        boxShadow: '0 8px 24px rgb(var(--scrim) / 0.18)',
      }}
    >
      <PhIcon name="ph-fill ph-warning-circle" size={17} color="rgb(var(--terracotta))" className="flex-shrink-0 mt-px" />
      <p className="m-0 flex-1 text-[12.5px] font-bold leading-[1.45]" style={{ color: 'rgb(var(--brown))' }}>
        {message}
      </p>
    </div>
  );
}
