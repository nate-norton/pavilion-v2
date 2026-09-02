import type { ReactNode } from 'react';
import { PhIcon } from '../components/PhIcon';

/**
 * The shared chrome for every screen at the front door. Two beds: `paper`
 * (a white card on the mist gradient — forms, arrival) and `chrome` (the
 * community speaking, in skydeep with mist type — the welcome). Controls on
 * chrome are white pills with sky text, since sunset and sky both fail AA
 * against skydeep.
 */
export const SHELL_BG = 'radial-gradient(120% 90% at 50% 0%, rgb(var(--misttint)) 0%, rgb(var(--skywash)) 60%, rgb(var(--skyedge)) 100%)';
const CARD_STYLE = { border: '1px solid rgb(var(--navy) / 0.08)', boxShadow: '0 18px 50px rgb(var(--scrim) / 0.12)' } as const;
const CHROME_STYLE = { boxShadow: '0 18px 50px rgb(var(--scrim) / 0.22)' } as const;

export const FIELD = 'w-full rounded-xl px-4 py-3 text-[14px] font-semibold text-navy outline-none font-sans';
export const FIELD_STYLE = { border: '1px solid rgb(var(--navy) / 0.14)', background: 'rgb(var(--mistpale))' } as const;

export function AuthShell({ children, width = 360, bed = 'paper', footer = true }: {
  children: ReactNode; width?: number; bed?: 'paper' | 'chrome'; footer?: boolean;
}) {
  const chrome = bed === 'chrome';
  return (
    <div className="min-h-dvh flex items-center justify-center p-6" style={{ background: SHELL_BG }}>
      <div className="w-full flex flex-col items-center gap-4" style={{ maxWidth: width }}>
        <div
          className={`w-full rounded-[24px] p-7 ${chrome ? '' : 'bg-paper'}`}
          style={chrome ? { ...CHROME_STYLE, background: 'rgb(var(--skydeep))', color: 'rgb(var(--mist))' } : CARD_STYLE}
        >
          {children}
        </div>
        {footer && (
          <p className="m-0 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.14em', color: 'rgb(var(--slate))' }}>
            Pavilion
          </p>
        )}
      </div>
    </div>
  );
}

/** Uppercase eyebrow. On chrome it goes peach (4.52:1 on skydeep); on paper, accent. */
export function Eyebrow({ children, onChrome = false }: { children: ReactNode; onChrome?: boolean }) {
  return (
    <p
      className="m-0 mb-2.5 text-[11px] font-extrabold uppercase"
      style={{ letterSpacing: '0.14em', color: onChrome ? 'rgb(var(--peach))' : 'rgb(var(--accent))' }}
    >
      {children}
    </p>
  );
}

export function AuthError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="m-0 mb-3 text-[12.5px] font-bold" style={{ color: 'rgb(var(--sunsetdeep))' }}>
      {message}
    </p>
  );
}

export function PrimaryButton({ label, busyLabel, busy = false, disabled = false, onClick, onChrome = false }: {
  label: string; busyLabel?: string; busy?: boolean; disabled?: boolean; onClick: () => void; onChrome?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy || disabled}
      className="w-full border-none rounded-xl py-3.5 text-[14px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
      style={{
        background: onChrome ? 'rgb(var(--white))' : 'rgb(var(--skydeep))',
        color: onChrome ? 'rgb(var(--skydeep))' : 'rgb(var(--white))',
        opacity: busy || disabled ? 0.6 : 1,
      }}
    >
      {busy ? (busyLabel ?? label) : label}
    </button>
  );
}

export function GhostButton({ label, onClick, onChrome = false, disabled = false }: {
  label: string; onClick: () => void; onChrome?: boolean; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-transparent rounded-xl py-3 text-[13px] font-bold cursor-pointer font-sans active:scale-[0.98]"
      style={{
        border: `1px solid ${onChrome ? 'rgb(var(--mist) / 0.3)' : 'rgb(var(--navy) / 0.14)'}`,
        color: onChrome ? 'rgb(var(--mist))' : 'rgb(var(--navy))',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

/** A quiet text-only action — "Forgot password?", "Not you?". */
export function TextButton({ label, onClick, onChrome = false, strong = false }: {
  label: string; onClick: () => void; onChrome?: boolean; strong?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-transparent border-none p-1 text-[12.5px] cursor-pointer font-sans ${strong ? 'font-extrabold' : 'font-bold'}`}
      style={{ color: onChrome ? 'rgb(var(--mist) / 0.9)' : strong ? 'rgb(var(--navy))' : 'rgb(var(--slate))' }}
    >
      {label}
    </button>
  );
}

/** Round icon badge that opens each card. */
export function IconBadge({ icon, onChrome = false }: { icon: string; onChrome?: boolean }) {
  return (
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: onChrome ? 'rgb(var(--mist) / 0.14)' : 'rgb(var(--skypale))' }}
    >
      <PhIcon name={icon} size={24} color={onChrome ? 'rgb(var(--peach))' : 'rgb(var(--skydeep))'} />
    </div>
  );
}
