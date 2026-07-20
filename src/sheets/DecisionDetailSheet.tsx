import { Sheet } from '../components/Sheet';
import { ProgressBar } from '../components/ProgressBar';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';

const DECISIONS = [
  {
    date: 'June 18, 2026',
    text: 'Approved fence colors expanded to five',
    yes: 91,
    no: 22,
    passed: true,
    detail: 'Residents may now choose from five pre-approved fence colors: Sandstone, Sage, Bark, Slate, and Cream. Previous palette had three options.',
    board: ['Lisa Hwang (President)', 'David Okafor (Secretary)', 'Maria Solis (Treasurer)'],
  },
  {
    date: 'May 30, 2026',
    text: 'Snow-removal contract renewed, 2 years',
    yes: 104,
    no: 9,
    passed: true,
    detail: 'Renewed contract with Summit Snow Services for 2026–2028 seasons at $18,400/year. Includes driveways, sidewalks, and community parking areas.',
    board: ['Lisa Hwang (President)', 'David Okafor (Secretary)', 'Maria Solis (Treasurer)'],
  },
  {
    date: 'May 12, 2026',
    text: 'Speed bumps on Alder Way',
    yes: 48,
    no: 71,
    passed: false,
    detail: 'Proposal to install two speed bumps on Alder Way near the playground. Declined due to emergency vehicle access concerns and resident feedback.',
    board: ['Lisa Hwang (President)', 'David Okafor (Secretary)', 'Maria Solis (Treasurer)'],
  },
];

export function DecisionDetailSheet() {
  const decisionDetailIdx = usePavStore((s) => s.decisionDetailIdx);
  const set = usePavStore((s) => s.set);

  if (decisionDetailIdx == null) return null;

  const d = DECISIONS[decisionDetailIdx];
  if (!d) return null;

  const total = d.yes + d.no;
  const pct = Math.round((d.yes / total) * 100);

  return (
    <Sheet open onClose={() => set({ decisionDetailIdx: null })}>
      <p className="m-0 font-serif text-[19px] text-navy mb-1">{d.text}</p>
      <p className="m-0 text-[12.5px] font-bold mb-4" style={{ color: 'rgb(var(--stone))' }}>
        {d.date}
      </p>

      <div className="flex items-center justify-between gap-2.5 mb-2">
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold"
          style={{
            background: d.passed ? 'rgb(var(--mint))' : 'rgb(var(--blush))',
            color: d.passed ? 'rgb(var(--sagedark))' : 'rgb(var(--terracotta))',
          }}
        >
          {d.passed ? 'Passed' : 'Declined'}
        </span>
        <span className="text-[13px] font-bold text-navy">
          {d.yes}–{d.no}
        </span>
      </div>

      <div className="mb-5">
        <ProgressBar pct={pct} color={d.passed ? 'rgb(var(--sage))' : 'rgb(var(--terracotta))'} />
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--sage))' }}>
            Yes {pct}%
          </span>
          <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--terracotta))' }}>
            No {100 - pct}%
          </span>
        </div>
      </div>

      <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3">
        <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgb(var(--stonelight))' }}>
          Summary
        </p>
        <p className="m-0 text-[13.5px] font-semibold text-navy leading-relaxed">{d.detail}</p>
      </div>

      <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3">
        <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgb(var(--stonelight))' }}>
          Board members present
        </p>
        {d.board.map((name) => (
          <div key={name} className="flex items-center gap-2 py-1">
            <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sage))" />
            <span className="text-[13px] font-bold text-navy">{name}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => set({ docsOpen: true, docReader: false, decisionDetailIdx: null })}
        className="w-full rounded-2xl py-3 border-none text-[13.5px] font-extrabold cursor-pointer font-sans bg-transparent"
        style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', color: 'rgb(var(--navy))' }}
      >
        View full meeting minutes
      </button>
    </Sheet>
  );
}
