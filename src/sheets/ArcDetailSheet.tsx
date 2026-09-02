import { Sheet } from '../components/Sheet';
import { StatusTimeline } from '../components/StatusTimeline';
import type { StatusStep } from '../components/StatusTimeline';
import { PhIcon } from '../components/PhIcon';
import { Card } from '../components/Card';
import { Pill, type PillTone } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
import { useArc, useRepository } from '../data/repo';
import type { ArcRequest } from '../data/repo';
import { usePavStore } from '../store/store';

/**
 * What the sheet renders, whichever backend fed it. Live rows come straight
 * off `useArc()`; the two demo items below are the rehearsed script and never
 * reach a live community.
 */
interface ArcView {
  id: string;
  ref: string;
  title: string;
  statusLabel: string;
  tone: PillTone;
  steps: StatusStep[];
  description?: string;
  conditions?: string;
  /** The board's note: a question when info is requested, a reason on decline. */
  decisionNote?: string;
  infoRequested: boolean;
  attachmentUrls: string[];
}

/** One vocabulary for ARC status, shared with the Pill tone map. */
function toneFor(status: string | undefined, approved: boolean): PillTone {
  switch (status) {
    case 'approved': return 'success';
    case 'declined': return 'danger';
    case 'info_requested': return 'warning';
    case 'in_review':
    case 'submitted': return 'info';
    default: return approved ? 'success' : 'info';
  }
}

function fromLive(r: ArcRequest): ArcView {
  return {
    id: r.id,
    ref: r.ref,
    title: r.title,
    statusLabel: r.statusLabel,
    tone: toneFor(r.status, r.approved),
    steps: r.steps,
    conditions: r.conditions || undefined,
    decisionNote: r.decisionNote || undefined,
    infoRequested: r.status === 'info_requested',
    attachmentUrls: r.attachmentUrls ?? [],
  };
}

/** The presenter demo's two scripted requests, driven by the scenario flags. */
function getDemoItems(state: ReturnType<typeof usePavStore.getState>): Record<string, ArcView> {
  const approved = state.arcApprovedByBoard;
  const arcType = state.arcType || 'Exterior update';

  return {
    'A-118': {
      id: 'A-118',
      ref: '#A-118',
      title: 'Backyard pergola',
      statusLabel: 'Approved',
      tone: 'success',
      steps: [
        { label: 'Submitted\nMay 15', state: 'done' },
        { label: 'Board\nreview', state: 'done' },
        { label: 'Approved\nJun 2', state: 'done' },
      ],
      description: '12×14 cedar pergola with retractable shade canopy, rear patio.',
      conditions: 'Complete within 90 days. Maintain original footprint. Natural wood or approved earth-tone stain only.',
      infoRequested: false,
      attachmentUrls: [],
    },
    'A-121': {
      id: 'A-121',
      ref: '#A-121',
      title: arcType,
      statusLabel: approved ? 'Approved' : 'In review',
      tone: approved ? 'success' : 'info',
      steps: [
        { label: 'Submitted Jul 1', state: 'done' },
        { label: 'Board review', state: approved ? 'done' : 'active' },
        { label: 'Decision', state: approved ? 'done' : 'pending' },
      ],
      description: state.arcDesc || 'Submitted via Pavilion on July 1, 2026.',
      conditions: approved ? 'Conditions will follow via email within 5 business days.' : undefined,
      infoRequested: false,
      attachmentUrls: [],
    },
  };
}

export function ArcDetailSheet() {
  const arcDetailId = usePavStore((s) => s.arcDetailId);
  const state = usePavStore();
  const set = usePavStore((s) => s.set);
  const repo = useRepository();
  const arc = useArc();

  if (!arcDetailId) return null;

  const demo = repo.isDemo();
  const item: ArcView | undefined = demo
    ? getDemoItems(state)[arcDetailId]
    : (() => { const r = arc.requests.find((x) => x.id === arcDetailId); return r ? fromLive(r) : undefined; })();

  const close = () => set({ arcDetailId: null });

  // Demo ids that are not scripted never open (unchanged). A live id that is
  // no longer in the member's list — withdrawn, or the row was removed —
  // says so instead of opening nothing.
  if (!item) {
    if (demo) return null;
    return (
      <Sheet open onClose={close} label="Request not found">
        <h2 className="m-0 mb-1.5 font-serif font-normal text-[19px] text-navy leading-[1.25]">We can't find that request</h2>
        <p className="m-0 mb-4 text-[13.5px] font-semibold text-slate leading-[1.5]">
          It may have been withdrawn. Your current requests are listed under My Place.
        </p>
        <button
          type="button"
          onClick={close}
          className="w-full border-none rounded-2xl min-h-[44px] py-3 text-[14px] font-extrabold cursor-pointer font-sans text-white bg-skydeep"
        >
          Close
        </button>
      </Sheet>
    );
  }

  const boardNoteTitle = item.infoRequested ? 'Board asked' : item.tone === 'danger' ? 'Why it was declined' : 'Board note';

  return (
    <Sheet open onClose={close} label={`Request ${item.ref}`}>
      <div className="flex items-start justify-between gap-2.5 mb-1">
        <h2 className="m-0 font-serif font-normal text-[19px] text-navy leading-[1.25] min-w-0">{item.title}</h2>
        <div className="flex-shrink-0 pt-0.5">
          <Pill label={item.statusLabel} tone={item.tone} size="md" />
        </div>
      </div>
      <p className="m-0 mb-4 text-[13px] font-semibold text-slate">Request {item.ref}</p>

      {item.steps.length > 0 && (
        <div className="mb-5">
          <StatusTimeline steps={item.steps} />
        </div>
      )}

      {/* The one thing that asks for a decision: the board's question. */}
      {item.infoRequested && (
        <Card elevation="raised" tint="goldpale" className="mb-3.5">
          <SectionHeading title={boardNoteTitle} />
          <p className="m-0 text-[13.5px] font-semibold text-navy leading-relaxed">
            {item.decisionNote || 'The board needs more detail before it can decide.'}
          </p>
          {!demo && (
            <button
              type="button"
              onClick={() => set({ arcDetailId: null, arcSheetOpen: true })}
              className="w-full mt-3 border-none rounded-2xl min-h-[44px] py-3 text-[14px] font-extrabold cursor-pointer font-sans text-white bg-skydeep"
            >
              Send an updated request
            </button>
          )}
        </Card>
      )}

      {item.description && (
        <Card className="mb-3.5">
          <SectionHeading title="Description" />
          <p className="m-0 text-[13.5px] font-semibold text-navy leading-relaxed">{item.description}</p>
        </Card>
      )}

      {item.conditions && (
        <Card className="mb-3.5">
          <SectionHeading title="Conditions" />
          <p className="m-0 text-[13.5px] font-semibold text-navy leading-relaxed">{item.conditions}</p>
        </Card>
      )}

      {!item.infoRequested && item.decisionNote && (
        <Card className="mb-3.5">
          <SectionHeading title={boardNoteTitle} />
          <p className="m-0 text-[13.5px] font-semibold text-navy leading-relaxed">{item.decisionNote}</p>
        </Card>
      )}

      {item.attachmentUrls.length > 0 && (
        <Card className="mb-3.5">
          <SectionHeading title="Attachments" meta={`${item.attachmentUrls.length} ${item.attachmentUrls.length === 1 ? 'file' : 'files'}`} />
          <ul className="m-0 p-0 list-none flex flex-col">
            {item.attachmentUrls.map((u, j) => (
              <li key={u}>
                <a
                  href={u}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 min-h-[44px] text-[13px] font-extrabold no-underline"
                  style={{ color: 'rgb(var(--accent))' }}
                >
                  <PhIcon name="ph-bold ph-paperclip" size={14} color="rgb(var(--accent))" />
                  Attachment {j + 1}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {!demo && !item.description && !item.conditions && !item.decisionNote && item.attachmentUrls.length === 0 && (
        <p className="m-0 text-[13px] font-semibold text-slate">No notes from the board yet.</p>
      )}

      {/* Scripted assistant line: presenter demo only, never a live claim. */}
      {demo && (
        <div
          className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
          style={{ background: 'rgb(var(--sage) / 0.06)', border: '1px solid rgb(var(--sage) / 0.12)' }}
        >
          <PhIcon name="ph-fill ph-sparkle" size={16} color="rgb(var(--sage))" />
          <p className="m-0 text-[12.5px] font-semibold text-navy">
            AI: ARC reviews take 10–14 business days per §4.3 of the CC&amp;Rs.
          </p>
        </div>
      )}
    </Sheet>
  );
}
