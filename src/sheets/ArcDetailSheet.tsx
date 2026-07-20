import { Sheet } from '../components/Sheet';
import { StatusTimeline } from '../components/StatusTimeline';
import type { StatusStep } from '../components/StatusTimeline';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';

interface ArcItem {
  id: string;
  title: string;
  status: 'Approved' | 'In review';
  steps: StatusStep[];
  description: string;
  conditions?: string;
}

function getItems(state: ReturnType<typeof usePavStore.getState>): Record<string, ArcItem> {
  const approved = state.arcApprovedByBoard;
  const arcType = state.arcType || 'Exterior update';

  return {
    'A-118': {
      id: 'A-118',
      title: 'Backyard pergola',
      status: 'Approved',
      steps: [
        { label: 'Submitted\nMay 15', state: 'done' },
        { label: 'Board\nreview', state: 'done' },
        { label: 'Approved\nJun 2', state: 'done' },
      ],
      description: '12×14 cedar pergola with retractable shade canopy, rear patio.',
      conditions: 'Complete within 90 days. Maintain original footprint. Natural wood or approved earth-tone stain only.',
    },
    'A-121': {
      id: 'A-121',
      title: arcType,
      status: approved ? 'Approved' : 'In review',
      steps: [
        { label: 'Submitted Jul 1', state: 'done' },
        { label: 'Board review', state: approved ? 'done' : 'active' },
        { label: 'Decision', state: approved ? 'done' : 'pending' },
      ],
      description: state.arcDesc || 'Submitted via Pavilion on July 1, 2026.',
      conditions: approved ? 'Conditions will follow via email within 5 business days.' : undefined,
    },
  };
}

export function ArcDetailSheet() {
  const arcDetailId = usePavStore((s) => s.arcDetailId);
  const state = usePavStore();
  const set = usePavStore((s) => s.set);

  if (!arcDetailId) return null;

  const items = getItems(state);
  const item = items[arcDetailId];
  if (!item) return null;

  const isApproved = item.status === 'Approved';

  return (
    <Sheet open onClose={() => set({ arcDetailId: null })}>
      <div className="flex items-center justify-between gap-2.5 mb-4">
        <p className="m-0 font-serif text-[19px] text-navy">{item.title}</p>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold flex-shrink-0"
          style={{
            background: isApproved ? 'rgb(var(--mint))' : 'rgb(var(--blush))',
            color: isApproved ? 'rgb(var(--sagedark))' : 'rgb(var(--terracotta))',
          }}
        >
          {item.status}
        </span>
      </div>

      <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'rgb(var(--stonelight))' }}>
        Request #{item.id}
      </p>

      <div className="mb-5 mt-3">
        <StatusTimeline steps={item.steps} />
      </div>

      <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3.5">
        <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgb(var(--stonelight))' }}>
          Description
        </p>
        <p className="m-0 text-[13.5px] font-semibold text-navy leading-relaxed">
          {item.description}
        </p>
      </div>

      {item.conditions && (
        <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3.5">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgb(var(--stonelight))' }}>
            Conditions
          </p>
          <p className="m-0 text-[13.5px] font-semibold text-navy leading-relaxed">
            {item.conditions}
          </p>
        </div>
      )}

      <div
        className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
        style={{ background: 'rgb(var(--sage) / 0.06)', border: '1px solid rgb(var(--sage) / 0.12)' }}
      >
        <PhIcon name="ph-fill ph-sparkle" size={16} color="rgb(var(--sage))" />
        <p className="m-0 text-[12.5px] font-semibold text-navy">
          AI: ARC reviews take 10–14 business days per §4.3 of the CC&amp;Rs.
        </p>
      </div>
    </Sheet>
  );
}
