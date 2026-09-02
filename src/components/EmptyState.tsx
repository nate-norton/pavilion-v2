import type { ReactNode } from 'react';
import { PhIcon } from './PhIcon';
import { useRepository } from '../data/repo';
import type { LoadState } from '../data/repo';

export interface EmptyStateProps {
  icon: string;
  title: string;
  /** What a resident sees: what will appear here, and why it matters. */
  body: ReactNode;
  /** Board-only override: the same emptiness, stated as something to do. */
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Hydration status for the domain this stands in for. Pass it and the
   * component stops claiming "nothing here" while data is still in flight or
   * after a request failed.
   */
  status?: LoadState;
}

/**
 * Shared empty state.
 *
 * Two responsibilities, both about honesty:
 *
 * - **Role.** `actionLabel`/`onAction` are passed only when the viewer can
 *   actually fix the emptiness. Every empty state here was originally written
 *   to a resident — "documents appear once your board publishes them" — which
 *   is a dead end for the one person who can publish them.
 * - **Certainty.** With `status`, an absence is only reported as an absence
 *   once the data has actually arrived. A failed request renders as a failure
 *   with a retry, not as "No open votes" — which in a transparency product
 *   would be confidently wrong rather than merely unhelpful.
 */
export function EmptyState({ icon, title, body, actionLabel, onAction, status = 'ready' }: EmptyStateProps) {
  const repo = useRepository();

  if (status === 'loading') return <EmptyStateSkeleton />;

  if (status === 'error') {
    return (
      <Shell>
        <div className="flex justify-center">
          {/* PhIcon renders nothing for a name outside its map — keep to
              icons the map actually carries. */}
          <PhIcon name="ph-fill ph-warning" size={26} color="rgb(var(--slatefaint))" />
        </div>
        <p className="m-0 mt-2 text-[13.5px] font-bold text-navy">Couldn’t load this</p>
        <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-slate leading-[1.5]">
          Something went wrong on our side — this isn’t empty, we just couldn’t reach it.
        </p>
        <button
          type="button"
          onClick={() => repo.retry()}
          className="mt-3.5 border-none rounded-[11px] text-[12.5px] font-extrabold cursor-pointer font-sans text-white"
          style={{ background: 'rgb(var(--skydeep))', padding: '9px 16px' }}
        >
          Try again
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      {/*
        Phosphor renders its SVG as display:block, so the parent's text-center
        never reached it — every empty state in the app has been drawing a
        left-aligned icon above centred text. The flex wrapper centres it.
      */}
      <div className="flex justify-center">
        <PhIcon name={icon} size={26} color="rgb(var(--slatefaint))" />
      </div>
      <p className="m-0 mt-2 text-[13.5px] font-bold text-navy">{title}</p>
      <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-slate leading-[1.5]">{body}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-3.5 border-none rounded-[11px] text-[12.5px] font-extrabold cursor-pointer font-sans text-white"
          style={{ background: 'rgb(var(--skydeep))', padding: '9px 16px' }}
        >
          {actionLabel}
        </button>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-paper rounded-[18px] p-6 text-center"
      style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}
    >
      {children}
    </div>
  );
}

/**
 * Loading placeholder shaped like the content it replaces, so the card doesn't
 * change height when data lands. Tonal only — the system has no spinner, and
 * a pulsing sand block is quieter than one on a warm page.
 */
function EmptyStateSkeleton() {
  return (
    <Shell>
      <div className="flex flex-col items-center animate-skeleton" aria-hidden="true">
        <div className="rounded-full" style={{ width: 26, height: 26, background: 'rgb(var(--skyborder))' }} />
        <div className="rounded-full mt-2.5" style={{ width: 132, height: 11, background: 'rgb(var(--skyborder))' }} />
        <div className="rounded-full mt-2" style={{ width: 196, height: 9, background: 'rgb(var(--skyrule))' }} />
      </div>
      <span className="sr-only">Loading…</span>
    </Shell>
  );
}
