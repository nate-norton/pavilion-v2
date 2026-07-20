import { Sheet } from '../components/Sheet';
import { StatusTimeline } from '../components/StatusTimeline';
import type { StatusStep } from '../components/StatusTimeline';
import { PhIcon } from '../components/PhIcon';
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
      iconColor: 'rgb(var(--terracotta))',
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
      iconColor: 'rgb(var(--stonelight))',
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

export function IssueDetailSheet() {
  const issueDetailId = usePavStore((s) => s.issueDetailId);
  const state = usePavStore();
  const set = usePavStore((s) => s.set);

  if (!issueDetailId) return null;

  const issues = getIssues(state);
  const issue = issues[issueDetailId];
  if (!issue) return null;

  const isResolved = issue.steps.every((s) => s.state === 'done');

  return (
    <Sheet open onClose={() => set({ issueDetailId: null })}>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: `${issue.iconColor}15` }}
        >
          <PhIcon name={issue.icon} size={20} color={issue.iconColor} />
        </div>
        <div className="flex-1">
          <p className="m-0 font-serif text-[19px] text-navy">{issue.title}</p>
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold flex-shrink-0"
          style={{
            background: isResolved ? 'rgb(var(--mint))' : 'rgb(var(--goldpale))',
            color: isResolved ? 'rgb(var(--sagedark))' : 'rgb(var(--golddark))',
          }}
        >
          {isResolved ? 'Resolved' : 'Open'}
        </span>
      </div>

      <div className="mb-5">
        <StatusTimeline steps={issue.steps} />
      </div>

      <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3">
        <div className="flex items-center gap-2.5 mb-2">
          <PhIcon name="ph-fill ph-map-trifold" size={14} color="rgb(var(--stone))" />
          <p className="m-0 text-[13px] font-bold text-navy">{issue.location}</p>
        </div>
        <div className="flex items-center gap-2.5">
          <PhIcon name="ph-fill ph-users" size={14} color="rgb(var(--stone))" />
          <p className="m-0 text-[13px] font-bold text-navy">{issue.reporters}</p>
        </div>
      </div>

      {issue.vendor && (
        <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgb(var(--stonelight))' }}>
            Vendor
          </p>
          <p className="m-0 text-[13.5px] font-bold text-navy">{issue.vendor}</p>
        </div>
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
