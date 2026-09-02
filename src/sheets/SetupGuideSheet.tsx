import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
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
      <SectionHeading level="subtitle" title={step.title} meta={`Step ${idx + 1} of ${steps.length} · ${communityName}`} className="mb-1.5" />
      <p className="m-0 mb-4 text-[13.5px] font-semibold leading-[1.5] text-slatedeep">
        {step.payoff}
      </p>

      {/* Right now — the live state this step reads. Honest at zero. */}
      <Card className="mb-3">
        <SectionHeading
          title="Right now"
          action={<Pill label={step.done ? 'Done' : 'To do'} tone={step.done ? 'success' : 'warning'} />}
        />
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
      </Card>

      <Card tint="skywash" className="mb-4">
        <SectionHeading title="What neighbors will see" />
        <p className="m-0 text-[13px] font-semibold text-slatedark leading-[1.5]">{step.sees}</p>
      </Card>

      {step.key === 'invite' ? (
        <Card elevation="raised" className="mb-3">
          <RosterInvite initiallyOpen />
        </Card>
      ) : (
        <button
          type="button"
          onClick={step.act ?? close}
          className="w-full border-none rounded-2xl min-h-[44px] py-3 text-[14px] font-extrabold cursor-pointer font-sans text-white active:scale-[0.98] mb-2 bg-skydeep"
        >
          {step.done ? `${step.cta} — add another` : step.cta}
        </button>
      )}

      <div className="flex items-center justify-between gap-2 mt-1">
        <p className="m-0 text-[12px] font-semibold text-slate">{doneCount} of {steps.length} done</p>
        {nextUndone ? (
          <button
            type="button"
            onClick={() => set({ setupGuideStep: nextUndone.key })}
            className="bg-transparent border-none px-2 min-h-[44px] text-[13px] font-extrabold cursor-pointer font-sans"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Next: {nextUndone.title} →
          </button>
        ) : (
          <button type="button" onClick={close} className="bg-transparent border-none px-2 min-h-[44px] text-[13px] font-extrabold cursor-pointer font-sans text-navy">
            Done
          </button>
        )}
      </div>
    </Sheet>
  );
}
