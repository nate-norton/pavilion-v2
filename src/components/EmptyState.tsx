import type { ReactNode } from 'react';
import { PhIcon } from './PhIcon';

export interface EmptyStateProps {
  icon: string;
  title: string;
  /** What a resident sees: what will appear here, and why it matters. */
  body: ReactNode;
  /** Board-only override: the same emptiness, stated as something to do. */
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Shared empty state.
 *
 * The point of the `actionLabel`/`onAction` pair is role honesty. Every empty
 * state in this app was originally written to a resident — "documents appear
 * here once your board publishes them" — which reads as a dead end to the one
 * person who can fix it. Callers pass an action only when the viewer can
 * actually act, so the board sees a door and residents see an honest wait.
 *
 * Empty is not the same as broken: the copy should always name what will live
 * here, so a quiet screen reads as early rather than failed.
 */
export function EmptyState({ icon, title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div
      className="bg-paper rounded-[18px] p-6 text-center"
      style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
    >
      {/*
        Phosphor renders its SVG as display:block, so the parent's text-center
        never reached it — every empty state in the app has been drawing a
        left-aligned icon above centred text. The flex wrapper is what
        actually centres it.
      */}
      <div className="flex justify-center">
        <PhIcon name={icon} size={26} color="rgb(var(--claypale))" />
      </div>
      <p className="m-0 mt-2 text-[13.5px] font-bold text-navy">{title}</p>
      <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-stone leading-[1.5]">{body}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3.5 border-none rounded-[11px] text-[12.5px] font-extrabold cursor-pointer font-sans text-white"
          style={{ background: 'rgb(var(--emberdeep))', padding: '9px 16px' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
