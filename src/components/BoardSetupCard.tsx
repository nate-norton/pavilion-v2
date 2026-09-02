import { PhIcon } from './PhIcon';
import { usePavStore } from '../store/store';
import { isLiveMode } from '../auth/AuthGate';
import { useSetupSteps } from './setupSteps';

/**
 * Board activation card (live mode, board role only).
 *
 * A pilot community starts empty, and every empty state in the app is written
 * to a resident: "documents appear here once your board publishes them." The
 * board member reading that *is* the board, so the one person who can act sees
 * a dead end. This card is the counterweight — the single place that tells a
 * new board what to do first.
 *
 * It leads with the next step and what the community holds right now, and
 * every row opens a slide-up guide (SetupGuideSheet) that explains the step
 * and does the work. Steps are derived, never stored — see setupSteps.ts —
 * so the card self-completes and retires when the community is running.
 */
export function BoardSetupCard() {
  const set = usePavStore((s) => s.set);
  const dismissed = usePavStore((s) => s.boardSetupDismissed);
  const { steps, communityName, isBoard } = useSetupSteps();

  // Demo is a scripted, fully-populated community — it has no setup to do.
  if (!isLiveMode || !isBoard) return null;

  const doneCount = steps.filter((s) => s.done).length;
  // Completing the list retires the card for good — no dismissal needed.
  if (doneCount === steps.length || dismissed) return null;

  const next = steps.find((s) => !s.done)!;
  const rest = steps.filter((s) => !s.done && s.key !== next.key);
  const done = steps.filter((s) => s.done);
  const open = (key: string) => set({ setupGuideStep: key });

  return (
    <div className="bg-paper rounded-[20px] mb-3.5 overflow-hidden" style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}>
      <div style={{ padding: '16px 18px 0' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="m-0 font-serif text-[19px] text-navy leading-[1.25]">Get {communityName} running</p>
            <p className="m-0 mt-1 text-[12.5px] font-semibold text-slate">
              {doneCount === 0
                ? `${steps.length} things, about fifteen minutes. Neighbors see the difference immediately.`
                : `${doneCount} of ${steps.length} done — ${steps.length - doneCount} left.`}
            </p>
          </div>
          <button
            type="button"
            aria-label="Hide setup checklist"
            onClick={() => set({ boardSetupDismissed: true })}
            className="border-none bg-transparent cursor-pointer p-1 flex-shrink-0 font-sans"
          >
            <PhIcon name="ph-bold ph-x" size={13} color="rgb(var(--slatelight))" />
          </button>
        </div>
        <div className="flex gap-1 mt-3" aria-hidden="true">
          {steps.map((s) => (
            <div key={s.key} className="flex-1 rounded-full" style={{ height: 4, background: s.done ? 'rgb(var(--sage))' : 'rgb(var(--navy) / 0.1)', transition: 'background 0.3s ease' }} />
          ))}
        </div>
      </div>

      {/* The next step, with what the community holds right now. */}
      <div className="mx-[18px] mt-3.5 rounded-2xl px-4 py-3.5" style={{ background: 'rgb(var(--mistpale))', border: '1px solid rgb(var(--navy) / 0.08)' }}>
        <p className="m-0 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.1em', color: 'rgb(var(--accent))' }}>Up next</p>
        <p className="m-0 mt-1 text-[15px] font-extrabold text-navy leading-[1.3]">{next.title}</p>
        <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-slate leading-[1.45]">{next.payoff}</p>
        <p className="m-0 mt-2 text-[12px] font-bold flex items-center gap-1.5" style={{ color: 'rgb(var(--slatedark))' }}>
          <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: 'rgb(var(--gold))' }} aria-hidden="true" />
          {next.detail}
        </p>
        {/* Exactly one primary action in this card: the next thing to do. */}
        <button
          type="button"
          onClick={() => open(next.key)}
          className="mt-3 w-full border-none rounded-[11px] py-2.5 text-[13px] font-extrabold cursor-pointer font-sans text-white active:scale-[0.98]"
          style={{ background: 'rgb(var(--skydeep))' }}
        >
          {next.cta}
        </button>
      </div>

      <div style={{ padding: '6px 18px 8px' }}>
        {rest.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => open(s.key)}
            className="w-full bg-transparent border-none text-left flex items-center gap-3 cursor-pointer font-sans"
            style={{ padding: '11px 0', borderBottom: '1px solid rgb(var(--navy) / 0.06)' }}
          >
            <span className="rounded-full flex-shrink-0" style={{ width: 18, height: 18, border: '1.5px solid rgb(var(--navy) / 0.18)' }} aria-hidden="true" />
            <span className="flex-1 min-w-0">
              <span className="block text-[13.5px] font-bold text-navy leading-[1.3]">{s.title}</span>
              <span className="block text-[11.5px] font-semibold text-slate">{s.detail}</span>
            </span>
            <PhIcon name="ph-bold ph-caret-right" size={12} color="rgb(var(--slatelight))" />
          </button>
        ))}
        {done.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2.5">
            {done.map((s) => (
              <button key={s.key} type="button" onClick={() => open(s.key)} className="bg-transparent border-none p-0 flex items-center gap-1.5 cursor-pointer font-sans">
                <PhIcon name="ph-fill ph-check-circle" size={13} color="rgb(var(--sage))" />
                <span className="text-[12px] font-bold text-slate line-through">{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
