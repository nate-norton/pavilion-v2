import { Sheet } from '../components/Sheet';
import { Pill } from '../components/Pill';
import { ProgressBar } from '../components/ProgressBar';
import { PhIcon } from '../components/PhIcon';
import { SectionHeading } from '../components/SectionHeading';
import { usePavStore } from '../store/store';

/*
 * Scripted decision detail. Decision rows are only tappable in the demo
 * (Hoa.tsx's RowShell), so this sheet never opens over live data; it stays a
 * presenter surface until the decisions domain carries a detail record.
 */
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
    <Sheet label="Decision detail" open onClose={() => set({ decisionDetailIdx: null })}>
      <h2 className="m-0 font-serif font-normal text-[19px] leading-[1.25] text-navy mb-1">{d.text}</h2>
      <p className="m-0 text-[12.5px] font-semibold mb-4" style={{ color: 'rgb(var(--slate))' }}>
        Decided {d.date}
      </p>

      <div className="flex items-center justify-between gap-2.5 mb-2">
        <Pill label={d.passed ? 'Passed' : 'Declined'} tone={d.passed ? 'success' : 'neutral'} size="md" />
        <span className="font-serif text-[19px] text-navy">
          {d.yes}–{d.no}
        </span>
      </div>

      {/*
        The "no" share reads in slate, not the accent: the accent is for
        links and active controls, and a result bar is neither.
      */}
      <div className="mb-5">
        <ProgressBar pct={pct} color={d.passed ? 'rgb(var(--sage))' : 'rgb(var(--slatelight))'} track="rgb(var(--skyborder))" />
        <div className="flex justify-between mt-1.5">
          <span className="text-[12px] font-bold" style={{ color: 'rgb(var(--sagedark))' }}>
            Yes {pct}%
          </span>
          <span className="text-[12px] font-bold text-slatedark">
            No {100 - pct}%
          </span>
        </div>
      </div>

      <SectionHeading title="Summary" className="mb-1.5" />
      <p className="m-0 mb-4 text-[13.5px] font-semibold text-navy leading-relaxed">{d.detail}</p>

      <SectionHeading title="Board members present" meta={`${d.board.length} of ${d.board.length}`} className="mb-1" />
      <ul className="m-0 mb-4 p-0 list-none">
        {d.board.map((name) => (
          <li key={name} className="flex items-center gap-2 py-1.5">
            <PhIcon name="ph-fill ph-check-circle" size={14} color="rgb(var(--sage))" />
            <span className="text-[13.5px] font-bold text-navy">{name}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => set({ docsOpen: true, docReader: false, decisionDetailIdx: null })}
        className="w-full rounded-2xl py-3 text-[13.5px] font-extrabold cursor-pointer font-sans bg-transparent"
        style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', color: 'rgb(var(--navy))', minHeight: 44 }}
      >
        View full meeting minutes
      </button>
    </Sheet>
  );
}
