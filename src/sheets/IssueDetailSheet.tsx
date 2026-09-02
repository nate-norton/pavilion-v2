import { Sheet } from '../components/Sheet';
import { StatusTimeline } from '../components/StatusTimeline';
import type { StatusStep } from '../components/StatusTimeline';
import { PhIcon } from '../components/PhIcon';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
import { useRepository } from '../data/repo';
import { usePavStore } from '../store/store';

interface IssueItem {
  title: string;
  icon: string;
  iconColor: string;
  location: string;
  reporters: string;
  vendor?: string;
  steps: StatusStep[];
  aiTip: string;
}

function getIssues(state: ReturnType<typeof usePavStore.getState>): Record<string, IssueItem> {
  return {
    streetlight: {
      title: 'Streetlight out',
      icon: 'ph-fill ph-lightbulb',
      iconColor: 'rgb(var(--gold))',
      location: 'Alder Way, near #27',
      reporters: 'Reported by 3 neighbors',
      vendor: state.reportTicketed ? 'BrightPath Electric · assigned' : undefined,
      steps: [
        { label: 'Reported\nJun 28', state: 'done' },
        { label: 'Triaged', state: state.reportTicketed ? 'done' : 'active' },
        { label: 'Assigned', state: state.reportTicketed ? 'done' : 'pending' },
        { label: 'Resolved', state: 'pending' },
      ],
      aiTip: 'Streetlight repairs are city responsibility, but the board coordinates. Typical turnaround: 5–7 business days once assigned.',
    },
    'pool-gate': {
      title: 'Pool gate latch',
      icon: 'ph-fill ph-wrench',
      iconColor: 'rgb(var(--accent))',
      location: 'Community pool, main entrance',
      reporters: 'Reported by 2 neighbors',
      vendor: state.gateScheduled ? 'AquaFix · scheduled Thu Jul 3' : undefined,
      steps: [
        { label: 'Reported\nJun 25', state: 'done' },
        { label: 'Triaged', state: 'done' },
        { label: 'Scheduled', state: state.gateScheduled ? 'done' : 'active' },
        { label: 'Resolved', state: 'pending' },
      ],
      aiTip: 'Pool gate latches are safety-critical per §6.3 of the CC&Rs. The board fast-tracks these items.',
    },
    irrigation: {
      title: 'Irrigation valve',
      icon: 'ph-fill ph-check-circle',
      iconColor: 'rgb(var(--slatelight))',
      location: 'The Green, northeast corner',
      reporters: 'Reported by 1 neighbor',
      vendor: 'GreenScape Landscaping · completed',
      steps: [
        { label: 'Reported\nJun 18', state: 'done' },
        { label: 'Triaged', state: 'done' },
        { label: 'Assigned', state: 'done' },
        { label: 'Fixed\nJun 24', state: 'done' },
      ],
      aiTip: 'Irrigation issues in common areas are handled by the landscaping vendor under the existing maintenance contract.',
    },
  };
}

/**
 * The scripted issue detail behind the demo's "Known issues" rows. Live rows
 * carry only a title and a status line, so the HOA screen never makes them
 * tappable there; this sheet is demo-only and says so in code rather than by
 * accident.
 */
export function IssueDetailSheet() {
  const issueDetailId = usePavStore((s) => s.issueDetailId);
  const state = usePavStore();
  const set = usePavStore((s) => s.set);
  const repo = useRepository();

  if (!issueDetailId || !repo.isDemo()) return null;

  const issues = getIssues(state);
  const issue = issues[issueDetailId];
  if (!issue) return null;

  const isResolved = issue.steps.every((s) => s.state === 'done');

  return (
    <Sheet open onClose={() => set({ issueDetailId: null })} label={`Issue: ${issue.title}`}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: `${issue.iconColor}15` }}
        >
          <PhIcon name={issue.icon} size={20} color={issue.iconColor} />
        </div>
        <h2 className="m-0 flex-1 min-w-0 font-serif font-normal text-[19px] text-navy leading-[1.25]">{issue.title}</h2>
        <div className="flex-shrink-0">
          <Pill label={isResolved ? 'Resolved' : 'Open'} tone={isResolved ? 'success' : 'warning'} size="md" />
        </div>
      </div>

      <div className="mb-5">
        <StatusTimeline steps={issue.steps} />
      </div>

      <Card className="mb-3">
        <div className="flex items-center gap-2.5 mb-2">
          <PhIcon name="ph-fill ph-map-trifold" size={14} color="rgb(var(--slate))" />
          <p className="m-0 text-[13px] font-bold text-navy">{issue.location}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <PhIcon name="ph-fill ph-users" size={14} color="rgb(var(--slate))" />
          <p className="m-0 text-[13px] font-bold text-navy">{issue.reporters}</p>
        </div>
      </Card>

      {issue.vendor && (
        <Card className="mb-3">
          <SectionHeading title="Vendor" />
          <p className="m-0 text-[13.5px] font-bold text-navy">{issue.vendor}</p>
        </Card>
      )}

      <div
        className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
        style={{ background: 'rgb(var(--sage) / 0.06)', border: '1px solid rgb(var(--sage) / 0.12)' }}
      >
        <PhIcon name="ph-fill ph-sparkle" size={16} color="rgb(var(--sage))" />
        <p className="m-0 text-[12.5px] font-semibold text-navy">{issue.aiTip}</p>
      </div>
    </Sheet>
  );
}
