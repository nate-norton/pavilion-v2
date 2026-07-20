import { PhIcon } from './PhIcon';

export interface StatusStep {
  label: string;
  state: 'done' | 'active' | 'pending';
  icon?: string;
}

export interface StatusTimelineProps {
  steps: StatusStep[];
}

const DOT_COLOR: Record<StatusStep['state'], string> = {
  done: 'rgb(var(--sage))',
  active: 'rgb(var(--gold))',
  pending: '#D9CFB8',
};

const DEFAULT_ICON: Record<StatusStep['state'], string> = {
  done: 'ph-bold ph-check',
  active: 'ph-bold ph-hourglass',
  pending: 'ph-bold ph-dots-three',
};

/** Dots + connecting segments used on ARC/violation status cards (lines 746-752). */
export function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        // Segment is green only when the next step is 'done'
        const nextStep = steps[i + 1];
        const segColor = nextStep && nextStep.state === 'done' ? 'rgb(var(--sage))' : '#D9CFB8';
        return (
          <div key={step.label} className="contents">
            <div className="flex flex-col items-center gap-1 flex-1">
              <span
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center"
                style={{ background: DOT_COLOR[step.state] }}
              >
                <PhIcon name={step.icon ?? DEFAULT_ICON[step.state]} size={11} color="#fff" />
              </span>
              <span className="text-[10.5px] font-bold text-bark text-center">
                {step.label.split('\n').map((line, j) => (
                  <span key={j}>
                    {j > 0 && <br />}
                    {line}
                  </span>
                ))}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="h-0.5 flex-1" data-testid="timeline-segment" style={{ background: segColor, margin: '0 2px 18px' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
