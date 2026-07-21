import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { Chip } from '../components/Chip';
import { usePavStore } from '../store/store';
import { useRepository } from '../data/repo';

const REPORT_CHIPS = ['Maintenance', 'Safety', 'Violation concern', 'Noise', 'Other'];

/** Private report sheet — ported from prototype lines 2223-2266. */
export function ReportSheet() {
  const state = usePavStore();
  const { set, submitReport } = state;
  const repo = useRepository();
  const demo = repo.isDemo();

  // Live resets the submitted flag on close so the member can file another
  // report later; the demo keeps its scripted one-shot flow.
  const closeReport = () => (demo
    ? set({ reportOpen: false })
    : set({ reportOpen: false, reportSubmitted: false, reportType: null }));
  const canReport = !!state.reportType;
  const send = () => {
    if (!canReport) return;
    if (demo) { submitReport(); return; }
    void repo.createReport({ kind: state.reportType ?? 'Other', description: state.reportDesc })
      .then(() => set({ reportSubmitted: true, reportDesc: '' }));
  };

  return (
    <Sheet open={state.reportOpen} onClose={closeReport} maxHeight="86%">
      {!state.reportSubmitted ? (
        <div>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">Report a problem</p>
          <p className="m-0 mb-4 text-[12.5px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
            Goes only to the board &amp; manager — never the public feed.
          </p>

          <p
            className="m-0 mb-2 text-[11px] font-bold uppercase text-stone"
            style={{ letterSpacing: '0.12em' }}
          >
            Category
          </p>
          <div className="flex gap-1.5 flex-wrap mb-4">
            {REPORT_CHIPS.map((label) => (
              <Chip
                key={label}
                label={label}
                active={state.reportType === label}
                onClick={() => set({ reportType: label })}
                size="md"
              />
            ))}
          </div>

          <p
            className="m-0 mb-2 text-[11px] font-bold uppercase text-stone"
            style={{ letterSpacing: '0.12em' }}
          >
            What&apos;s going on?
          </p>
          <textarea
            value={state.reportDesc}
            onChange={(e) => set({ reportDesc: e.target.value })}
            placeholder="e.g. Sprinkler head broken on the Green, spraying the sidewalk"
            className="w-full bg-[rgb(var(--paper))] rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans resize-none mb-3.5"
            style={{ minHeight: 70, border: '1px solid rgb(var(--navy) / 0.12)' }}
          />

          <button
            type="button"
            onClick={() => set({ reportPhoto: true })}
            className="w-full flex items-center justify-center gap-2 mb-4 cursor-pointer"
            style={{
              height: 70,
              border: state.reportPhoto ? '1.5px solid rgb(var(--sage) / 0.4)' : '1.5px dashed rgb(var(--navy) / 0.2)',
              borderRadius: 13,
              background: state.reportPhoto ? 'rgb(var(--mint))' : 'repeating-linear-gradient(-45deg,rgb(var(--creamdim)) 0 8px,rgb(var(--parchment)) 8px 16px)',
            }}
          >
            <PhIcon name={state.reportPhoto ? 'ph-fill ph-check-circle' : 'ph ph-camera-plus'} size={18} color={state.reportPhoto ? 'rgb(var(--sage))' : 'rgb(var(--stone))'} />
            <span className="font-mono text-[10px]" style={{ color: state.reportPhoto ? 'rgb(var(--sagedark))' : 'rgb(var(--stone))' }}>
              {state.reportPhoto ? 'photo added ✓' : 'add a photo (optional)'}
            </span>
          </button>

          <button
            onClick={send}
            className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold font-sans"
            style={{
              background: canReport ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))',
              color: canReport ? 'rgb(var(--white))' : 'rgb(var(--stonelight))',
              cursor: canReport ? 'pointer' : 'default',
            }}
          >
            {canReport ? 'Send privately to the board' : 'Pick a category'}
          </button>
        </div>
      ) : (
        <div className="text-center pt-1.5 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-shield-check" size={48} color="rgb(var(--sage))" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-xl text-navy">Sent — privately.</p>
          <p className="m-0 mb-3.5 text-[13px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
            {demo ? 'Ticket #M-89 · ' : ''}{state.reportType} · the board sees it, the feed never does
          </p>
          <div className="flex items-center justify-center gap-0 mb-4">
            <div className="flex flex-col items-center gap-1" style={{ width: 80 }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgb(var(--sage))' }}
              >
                <PhIcon name="ph-bold ph-check" size={10} color="rgb(var(--white))" />
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgb(var(--bark))' }}>
                Submitted
              </span>
            </div>
            <div className="h-0.5" style={{ background: 'rgb(var(--sanddim))', width: 36, marginBottom: 16 }} />
            <div className="flex flex-col items-center gap-1" style={{ width: 80 }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgb(var(--gold))' }}
              >
                <PhIcon name="ph-bold ph-hourglass" size={10} color="rgb(var(--white))" />
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgb(var(--bark))' }}>
                Triage
              </span>
            </div>
            <div className="h-0.5" style={{ background: 'rgb(var(--sanddim))', width: 36, marginBottom: 16 }} />
            <div className="flex flex-col items-center gap-1" style={{ width: 80 }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'rgb(var(--sanddim))' }}
              >
                <PhIcon name="ph-bold ph-dots-three" size={10} color="rgb(var(--white))" />
              </span>
              <span className="text-[10px] font-bold" style={{ color: 'rgb(var(--bark))' }}>
                Fixed
              </span>
            </div>
          </div>
          <p className="m-0 mb-3.5 text-xs font-bold" style={{ color: 'rgb(var(--stone))' }}>
            Track it anytime in My Place → My requests
          </p>
          <button
            onClick={closeReport}
            className="w-full border-none text-cream rounded-2xl py-3.5 text-sm font-extrabold cursor-pointer bg-navy"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
