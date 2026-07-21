import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { PhotoPlaceholder } from '../components/PhotoPlaceholder';
import { usePavStore } from '../store/store';
import { StatusTimeline, type StatusStep } from '../components/StatusTimeline';
import { useViolation, useRepository } from '../data/repo';

const VIOL_STEPS: StatusStep[] = [
  { label: 'Noticed\nJun 27', state: 'active', icon: 'ph-bold ph-eye' },
  { label: 'You fix it\nby Jul 8', state: 'pending', icon: 'ph-bold ph-check' },
  { label: 'Closes\nfor good', state: 'pending', icon: 'ph-bold ph-x' },
];

/** Violation courtesy-notice sheet — ported from prototype lines 2315-2357. */
export function ViolSheet() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();
  const viol = useViolation();

  const closeViol = () => set({ violSheetOpen: false });
  const markViolFixed = () => set({ violFixed: true });
  const violMsgBoard = () => set({ violSheetOpen: false, reportOpen: true, reportType: 'Violation concern' });

  // Live: a generic notice from the real violation row — no scripted #V-31 story.
  if (!repo.isDemo()) {
    return (
      <Sheet open={state.violSheetOpen} onClose={closeViol} maxHeight="86%">
        {!viol ? (
          <div className="text-center pt-1.5 pb-1">
            <PhIcon name="ph-fill ph-check-circle" size={40} color="rgb(var(--sage))" />
            <p className="m-0 mt-2.5 text-[15px] font-bold text-navy">Nothing open on your unit.</p>
          </div>
        ) : !viol.fixed ? (
          <div>
            <p className="m-0 mb-0.5 font-serif text-xl text-navy">A friendly heads-up</p>
            <p className="m-0 mb-3.5 text-[12.5px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
              Courtesy notice · no fee · nothing on your record
            </p>
            <div
              className="rounded-2xl p-[15px] mb-4"
              style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.1)' }}
            >
              <p className="m-0 mb-1 text-[13.5px] font-bold text-navy">{viol.title}</p>
              {viol.sub && <p className="m-0 text-xs font-semibold text-stone">{viol.sub}</p>}
            </div>
            <button
              onClick={() => void repo.markViolationFixed()}
              className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer text-white mb-2.5"
              style={{ background: 'rgb(var(--sage))' }}
            >
              I&apos;ve taken care of it
            </button>
            <button
              onClick={violMsgBoard}
              className="w-full bg-transparent rounded-[14px] py-3 text-[13px] font-extrabold cursor-pointer text-navy"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              Something&apos;s off? Message the board privately
            </button>
          </div>
        ) : (
          <div className="text-center pt-1.5 pb-1 animate-fadeup">
            <PhIcon name="ph-fill ph-check-circle" size={48} color="rgb(var(--sage))" />
            <p className="m-0 mt-2.5 mb-[3px] font-serif text-xl text-navy">
              Marked fixed. Thanks, neighbor.
            </p>
            <p className="m-0 mb-4 text-[13px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
              The board confirms on their next walk-through — then it closes with no record and no fee.
            </p>
            <button
              onClick={closeViol}
              className="w-full border-none text-cream rounded-2xl py-3.5 text-sm font-extrabold cursor-pointer bg-navy"
            >
              Done
            </button>
          </div>
        )}
      </Sheet>
    );
  }

  return (
    <Sheet open={state.violSheetOpen} onClose={closeViol} maxHeight="86%">
      {!state.violFixed ? (
        <div>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">A friendly heads-up</p>
          <p className="m-0 mb-3.5 text-[12.5px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
            Courtesy notice #V-31 · no fee · nothing on your record
          </p>
          <div
            className="rounded-2xl p-[15px] mb-3"
            style={{ background: 'rgb(var(--paper))', border: '1px solid rgb(var(--navy) / 0.1)' }}
          >
            <p className="m-0 mb-2 text-[13.5px] font-bold text-navy">
              Trash bins visible from the street · #27 Alder Way
            </p>
            <div className="mb-2.5">
              <PhotoPlaceholder label="photo — noted on walk-through, Jun 27" height={78} />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{ background: 'rgb(var(--cream))', border: '1px solid rgb(var(--navy) / 0.1)' }}
            >
              <PhIcon name="ph-fill ph-file-text" size={12} color="rgb(var(--terracotta))" />
              <span className="text-[11px] font-bold" style={{ color: 'rgb(var(--bark))' }}>
                CC&amp;Rs §6.3 · Bins stored out of street view except pickup day
              </span>
            </span>
          </div>

          <div className="mb-3.5">
            <StatusTimeline steps={VIOL_STEPS} />
          </div>

          <div
            className="rounded-[13px] p-[11px_13px] flex gap-2.5 items-start mb-4"
            style={{ background: 'rgb(var(--blush))' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={15} color="rgb(var(--terracotta))" className="mt-px flex-shrink-0" />
            <p className="m-0 text-xs leading-[1.5] font-bold" style={{ color: 'rgb(var(--brown))' }}>
              AI: two courtesy reminders always come before any fee (§9). Most notices close
              themselves — 2 neighbors self-cured this month.
            </p>
          </div>

          <button
            onClick={markViolFixed}
            className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer text-white mb-2.5"
            style={{ background: 'rgb(var(--sage))' }}
          >
            I&apos;ve taken care of it
          </button>
          <button
            onClick={violMsgBoard}
            className="w-full bg-transparent rounded-[14px] py-3 text-[13px] font-extrabold cursor-pointer text-navy"
            style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
          >
            Something&apos;s off? Message the board privately
          </button>
        </div>
      ) : (
        <div className="text-center pt-1.5 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-check-circle" size={48} color="rgb(var(--sage))" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-xl text-navy">
            Marked fixed. Thanks, neighbor.
          </p>
          <p className="m-0 mb-4 text-[13px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
            The board confirms on their next walk-through — then #V-31 closes with no record and no
            fee.
          </p>
          <button
            onClick={closeViol}
            className="w-full border-none text-cream rounded-2xl py-3.5 text-sm font-extrabold cursor-pointer bg-navy"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
