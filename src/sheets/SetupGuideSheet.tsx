import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { RosterInvite } from '../components/RosterInvite';
import { usePavStore } from '../store/store';
import { useSetupSteps } from '../components/setupSteps';

/**
 * One setup step, opened from the "Get {community} running" card as a
 * slide-up sheet. It guides rather than lists: why the step matters, what the
 * community holds right now, what neighbors will see once it's done, and the
 * action itself — inline for invites (the roster paste lives here), one tap
 * into the real surface for everything else. "Next" walks the remaining
 * steps in order.
 */
export function SetupGuideSheet() {
  const key = usePavStore((s) => s.setupGuideStep);
  const set = usePavStore((s) => s.set);
  const { steps, communityName } = useSetupSteps();
  const idx = steps.findIndex((s) => s.key === key);
  const step = idx >= 0 ? steps[idx] : null;
  const close = () => set({ setupGuideStep: null });
  if (!step) return null;

  const nextUndone = steps.find((s, i) => i > idx && !s.done) ?? steps.find((s) => !s.done && s.key !== step.key);
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <Sheet open onClose={close} label={`Setup: ${step.title}`} maxHeight="92%">
      <p className="m-0 mb-1.5 text-[11px] font-bold uppercase" style={{ letterSpacing: '0.12em', color: 'rgb(var(--accent))' }}>
        Step {idx + 1} of {steps.length} · {communityName}
      </p>
      <h2 className="m-0 mb-1.5 font-serif text-[19px] text-navy leading-[1.25]">{step.title}</h2>
      <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.5]" style={{ color: 'rgb(var(--slatedeep))' }}>
        {step.payoff}
      </p>

      {/* Right now — the live state this step reads. Honest at zero. */}
      <div className="rounded-2xl px-4 py-3 mb-3 bg-paper" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span
            className="inline-block rounded-full flex-shrink-0"
            style={{ width: 7, height: 7, background: step.done ? 'rgb(var(--sage))' : 'rgb(var(--gold))' }}
            aria-hidden="true"
          />
          <p className="m-0 text-[11px] font-bold uppercase text-slate" style={{ letterSpacing: '0.1em' }}>Right now</p>
        </div>
        <p className="m-0 text-[13.5px] font-bold text-navy">{step.detail}</p>
        {step.items.length > 0 && (
          <ul className="m-0 mt-2 p-0 list-none flex flex-col gap-1">
            {step.items.map((it) => (
              <li key={it} className="text-[12.5px] font-semibold text-slatedark flex items-center gap-2">
                <PhIcon name="ph-fill ph-check-circle" size={13} color="rgb(var(--sage))" />
                <span className="truncate">{it}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl px-4 py-3 mb-4" style={{ background: 'rgb(var(--skypale) / 0.6)', border: '1px solid rgb(var(--navy) / 0.06)' }}>
        <p className="m-0 mb-0.5 text-[11px] font-bold uppercase text-slate" style={{ letterSpacing: '0.1em' }}>What neighbors will see</p>
        <p className="m-0 text-[12.5px] font-semibold text-slatedark leading-[1.5]">{step.sees}</p>
      </div>

      {step.key === 'invite' ? (
        <div className="rounded-2xl px-4 py-3.5 mb-3 bg-paper" style={{ border: '1px solid rgb(var(--navy) / 0.08)' }}>
          <RosterInvite initiallyOpen />
        </div>
      ) : (
        <button
          type="button"
          onClick={step.act ?? close}
          className="w-full border-none rounded-xl py-3.5 text-[14px] font-extrabold cursor-pointer font-sans text-white active:scale-[0.98] mb-2"
          style={{ background: 'rgb(var(--skydeep))' }}
        >
          {step.done ? `${step.cta} — add another` : step.cta}
        </button>
      )}

      <div className="flex items-center justify-between gap-2 mt-1">
        <p className="m-0 text-[11.5px] font-semibold text-slate">{doneCount} of {steps.length} done</p>
        {nextUndone ? (
          <button
            type="button"
            onClick={() => set({ setupGuideStep: nextUndone.key })}
            className="bg-transparent border-none p-1 text-[12.5px] font-extrabold cursor-pointer font-sans"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Next: {nextUndone.title} →
          </button>
        ) : (
          <button type="button" onClick={close} className="bg-transparent border-none p-1 text-[12.5px] font-extrabold cursor-pointer font-sans text-navy">
            Done
          </button>
        )}
      </div>
    </Sheet>
  );
}
