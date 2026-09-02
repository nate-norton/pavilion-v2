import type { ReactNode } from 'react';
import { PhIcon } from '../components/PhIcon';
import { StackedCards, StackedPanel, type StackedTint } from '../components/StackedCard';

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
        {footer && <Wordmark />}
      </div>
    </div>
  );
}

function Wordmark() {
  return (
    <p className="m-0 text-[11px] font-extrabold uppercase" style={{ letterSpacing: '0.14em', color: 'rgb(var(--slate))' }}>
      Pavilion
    </p>
  );
}

/**
 * The front door as a place rather than a form. Every screen a person meets
 * on the way in — the invitation, sign-in, the name step, arrival — opens on
 * a hero panel that speaks in the community's chrome, with the form or the
 * next steps tucked under it on paper (the StackedCards overlap). Utility
 * steps that follow (check your email, new password, paste a code) stay on
 * the plain AuthShell card, since by then the person is already inside.
 *
 * The heading carries its own weight: there is no kicker above it. `facts`
 * is the slot beneath the title for what the panel knows for certain — an
 * address, a role — and renders nothing when there is nothing to say.
 */
export function Door({ tint = 'skydeep', icon, title, titleSize = 24, facts, lede, children }: {
  tint?: StackedTint;
  icon: string;
  title: ReactNode;
  /** 24 for a sentence; 36 when the title is a name that deserves the room. */
  titleSize?: 24 | 36;
  facts?: ReactNode;
  lede: ReactNode;
  children: ReactNode;
}) {
  const chrome = tint === 'skydeep';
  const titleColor = chrome ? 'rgb(var(--mist))' : 'rgb(var(--navy))';
  const ledeColor = chrome ? 'rgb(var(--mist) / 0.95)' : 'rgb(var(--slatedeep))';
  const titleClass = titleSize === 36 ? 'text-[36px] leading-[1.1]' : 'text-[24px] leading-[1.2]';
  return (
    <div className="min-h-dvh flex items-center justify-center p-6" style={{ background: SHELL_BG }}>
      <div className="w-full flex flex-col items-center gap-4" style={{ maxWidth: 380 }}>
        <StackedCards className="w-full">
          <StackedPanel tint={tint}>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: chrome ? 'rgb(var(--mist) / 0.14)' : 'rgb(var(--paper))' }}
            >
              <PhIcon name={icon} size={24} color={chrome ? 'rgb(var(--peach))' : 'rgb(var(--skydeep))'} />
            </div>
            <h1 className={`m-0 font-serif ${titleClass}`} style={{ color: titleColor, textWrap: 'balance' }}>{title}</h1>
            {facts && <div className="mt-2">{facts}</div>}
            <p className="m-0 mt-2 text-[13.5px] font-semibold leading-[1.5]" style={{ color: ledeColor }}>{lede}</p>
          </StackedPanel>
          <StackedPanel tint="paper" className="pt-6">
            {children}
          </StackedPanel>
        </StackedCards>
        <Wordmark />
      </div>
    </div>
  );
}

/**
 * A next step as a row: what it is, what the panel honestly knows about it,
 * and the one word that names the action. Rows stack under a hairline so a
 * list of them reads as choices, not as cards.
 */
export function NextStep({ title, meta, action, onClick }: {
  title: string; meta?: ReactNode; action: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full min-h-[52px] flex items-center justify-between gap-3 bg-transparent border-none px-0 py-3 text-left cursor-pointer font-sans active:scale-[0.99]"
      style={{ borderBottom: '1px solid rgb(var(--navy) / 0.08)' }}
    >
      <span className="min-w-0">
        <span className="block text-[13.5px] font-bold text-navy">{title}</span>
        {meta && <span className="block mt-0.5 text-[12px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>{meta}</span>}
      </span>
      <span className="inline-flex items-center gap-1 flex-shrink-0 text-[12.5px] font-extrabold" style={{ color: 'rgb(var(--accent))' }}>
        {action}
        <PhIcon name="ph-bold ph-caret-right" size={14} color="rgb(var(--accent))" />
      </span>
    </button>
  );
}

/** Show/Hide for a password field: a quiet text control under the field, 44px tall. */
export function ShowPassword({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      className="min-h-[44px] bg-transparent border-none px-1 text-[12.5px] font-extrabold cursor-pointer font-sans"
      style={{ color: 'rgb(var(--accent))' }}
    >
      {shown ? 'Hide password' : 'Show password'}
    </button>
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
      className="w-full min-h-[44px] border-none rounded-xl py-3.5 text-[14px] font-extrabold cursor-pointer font-sans active:scale-[0.98]"
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

/** The secondary action: a navy outline on paper, or a mist outline on chrome. */
export function GhostButton({ label, onClick, onChrome = false, disabled = false }: {
  label: string; onClick: () => void; onChrome?: boolean; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full min-h-[44px] bg-transparent rounded-xl py-3 text-[13px] font-bold cursor-pointer font-sans active:scale-[0.98]"
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

/** A quiet text-only action — "Forgot password?", "Not you?". Still a 44px target. */
export function TextButton({ label, onClick, onChrome = false, strong = false }: {
  label: string; onClick: () => void; onChrome?: boolean; strong?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] bg-transparent border-none px-1 py-1 text-[12.5px] cursor-pointer font-sans ${strong ? 'font-extrabold' : 'font-bold'}`}
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
