import { useState } from 'react';
import { Card } from '../components/Card';
import { PhIcon } from '../components/PhIcon';
import { Hint } from '../components/Hint';
import { Sheet } from '../components/Sheet';
import { PhotoPlaceholder } from '../components/PhotoPlaceholder';
import { reportedByDataLayer } from '../lib/errorBus';
import { usePavStore } from '../store/store';
import { StatusTimeline, type StatusStep } from '../components/StatusTimeline';
import { useViolation, useRepository } from '../data/repo';

const VIOL_STEPS: StatusStep[] = [
  { label: 'Noticed\nJun 27', state: 'active', icon: 'ph-bold ph-eye' },
  { label: 'You fix it\nby Jul 8', state: 'pending', icon: 'ph-bold ph-check' },
  { label: 'Closes\nfor good', state: 'pending', icon: 'ph-bold ph-x' },
];

/*
 * What each severity actually means, in the resident's terms. The demo
 * carried this for its courtesy notice and live dropped it — which left the
 * one person most likely to be upset with the least explanation.
 */
const SEVERITY_COPY = {
  courtesy: {
    title: 'A friendly heads-up',
    sub: 'Courtesy notice · no fee · nothing on your record',
    hint: 'What does a courtesy notice mean?',
    body: 'It is the first and lightest step: no fine, nothing recorded against your home, and it closes by itself once the issue is fixed. It only escalates if it is ignored.',
  },
  warning: {
    title: 'A formal heads-up',
    sub: 'Formal warning · no fee yet',
    hint: 'What does a formal warning mean?',
    body: 'A warning is recorded, but there is no fee attached. Fixing the issue and marking it here closes it; leaving it is what allows the board to move to a fine.',
  },
  fine: {
    title: 'A notice from your board',
    sub: 'Fine notice · amount below',
    hint: 'What does a fine notice mean?',
    body: 'A fine has been attached to this notice. Fixing the issue stops it from growing, and the board can waive or reduce it — message them privately if something here is wrong.',
  },
} as const;
type Severity = keyof typeof SEVERITY_COPY;
const severityOf = (s?: string): Severity => (s === 'fine' || s === 'warning' ? s : 'courtesy');

/** Violation courtesy-notice sheet — ported from prototype lines 2315-2357. */
export function ViolSheet() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();
  const viol = useViolation();
  const [busy, setBusy] = useState(false);

  const closeViol = () => set({ violSheetOpen: false });
  const markViolFixed = () => set({ violFixed: true });
  const violMsgBoard = () => set({ violSheetOpen: false, reportOpen: true, reportType: 'Violation concern' });
  const markFixedLive = () => {
    if (busy) return;
    setBusy(true);
    void repo.markViolationFixed().catch(reportedByDataLayer).finally(() => setBusy(false));
  };

  // Live: a generic notice from the real violation row — no scripted #V-31 story.
  if (!repo.isDemo()) {
    const sev = severityOf(viol?.severity);
    const copy = SEVERITY_COPY[sev];
    const photos = viol?.photoUrls ?? [];
    return (
      <Sheet
      label="Courtesy notice"
      open={state.violSheetOpen} onClose={closeViol} maxHeight="86%">
        {!viol ? (
          <div className="text-center pt-1.5 pb-1">
            <div className="flex justify-center">
              <PhIcon name="ph-fill ph-check-circle" size={40} color="rgb(var(--sage))" />
            </div>
            <p className="m-0 mt-2.5 text-[14px] font-bold text-navy">Nothing open on your unit.</p>
          </div>
        ) : !viol.fixed ? (
          <div>
            <h2 className="m-0 mb-0.5 font-serif font-normal text-[19px] leading-[1.25] text-navy">{copy.title}</h2>
            <p className="m-0 mb-1 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
              {copy.sub}
            </p>
            <div className="mb-3.5">
              <Hint label={copy.hint}>{copy.body}</Hint>
            </div>
            <Card padding="none" className="p-[15px] mb-4">
              <p className="m-0 mb-1 text-[13.5px] font-bold text-navy">{viol.title}</p>
              {viol.sub && sev !== 'fine' && <p className="m-0 text-[12.5px] font-semibold text-slate">{viol.sub}</p>}
              {viol.description && (
                <p className="m-0 mt-2 text-[13px] leading-[1.5] font-semibold text-navy">{viol.description}</p>
              )}
              {/*
                The fine lives in the board's own line ("$150 fine · contact
                the board with questions"); on a fine notice it is the one
                number the reader is looking for, so it gets a labelled row
                instead of a grey subtitle.
              */}
              {sev === 'fine' && viol.sub && (
                <div
                  className="mt-3 rounded-[11px] px-3 py-2.5 flex items-center gap-2.5"
                  style={{ background: 'rgb(var(--sunsetdim))' }}
                >
                  <PhIcon name="ph-fill ph-receipt" size={16} color="rgb(var(--sunsetdeep))" className="flex-shrink-0" />
                  <p className="m-0 text-[13px] font-bold" style={{ color: 'rgb(var(--sunsetdeep))' }}>{viol.sub}</p>
                </div>
              )}
              {/*
                Photos are captioned by what they are, never by a date: the
                notice row carries none, and the day the board walked past is
                exactly the kind of detail that must not be guessed.
              */}
              {photos.length > 0 && (
                <ul className="m-0 mt-3 p-0 list-none flex gap-2.5 overflow-x-auto pav-scroll">
                  {photos.map((u, i) => (
                    <li key={u} className="flex-shrink-0">
                      <a href={u} target="_blank" rel="noreferrer" className="block no-underline">
                        <img src={u} alt={`Photo ${i + 1} of ${photos.length} from the board`} className="rounded-[11px] block" style={{ height: 88, width: 88, objectFit: 'cover' }} />
                        <span className="block mt-1 text-[12px] font-bold text-slate">
                          Board photo {i + 1}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <button
              type="button"
              onClick={markFixedLive}
              disabled={busy}
              aria-busy={busy}
              className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer text-white mb-2.5 font-sans"
              style={{ background: 'rgb(var(--sagedark))', minHeight: 44, opacity: busy ? 0.7 : 1 }}
            >
              {busy ? 'Marking it fixed…' : 'I’ve taken care of it'}
            </button>
            <button
              type="button"
              onClick={violMsgBoard}
              className="w-full bg-transparent rounded-[14px] py-3 text-[13px] font-extrabold cursor-pointer text-navy font-sans"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', minHeight: 44 }}
            >
              Something&apos;s off? Message the board privately
            </button>
          </div>
        ) : (
          <div className="text-center pt-1.5 pb-1 animate-fadeup">
            <div className="flex justify-center">
              <PhIcon name="ph-fill ph-check-circle" size={48} color="rgb(var(--sage))" />
            </div>
            <p className="m-0 mt-2.5 mb-[3px] font-serif text-xl text-navy">
              Marked fixed. Thanks, neighbor.
            </p>
            <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
              {sev === 'courtesy'
                ? 'The board confirms on their next walk-through — then it closes with no record and no fee.'
                : 'The board confirms on their next walk-through — then it closes.'}
            </p>
            <button
              type="button"
              onClick={closeViol}
              className="w-full border-none text-mist rounded-2xl py-3.5 text-sm font-extrabold cursor-pointer bg-skydeep font-sans"
              style={{ minHeight: 44 }}
            >
              Done
            </button>
          </div>
        )}
      </Sheet>
    );
  }

  return (
    <Sheet label="Courtesy notice" open={state.violSheetOpen} onClose={closeViol} maxHeight="86%">
      {!state.violFixed ? (
        <div>
          <h2 className="m-0 mb-0.5 font-serif font-normal text-[19px] leading-[1.25] text-navy">A friendly heads-up</h2>
          <p className="m-0 mb-1 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
            Courtesy notice #V-31 · no fee · nothing on your record
          </p>
          <div className="mb-3.5">
            <Hint label="What does a courtesy notice mean?">
              It is the first and lightest step: no fine, nothing recorded
              against your home, and it closes by itself once the issue is
              fixed. It only escalates if it is ignored past the date above.
            </Hint>
          </div>
          <Card padding="none" className="p-[15px] mb-3">
            <p className="m-0 mb-2 text-[13.5px] font-bold text-navy">
              Trash bins visible from the street · #27 Alder Way
            </p>
            <div className="mb-2.5">
              <PhotoPlaceholder label="photo — noted on walk-through, Jun 27" height={78} />
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
              style={{ background: 'rgb(var(--mist))', border: '1px solid rgb(var(--navy) / 0.1)' }}
            >
              <PhIcon name="ph-fill ph-file-text" size={12} color="rgb(var(--accent))" />
              <span className="text-[12px] font-bold" style={{ color: 'rgb(var(--slatedark))' }}>
                CC&amp;Rs §6.3 · Bins stored out of street view except pickup day
              </span>
            </span>
          </Card>

          <div className="mb-3.5">
            <StatusTimeline steps={VIOL_STEPS} />
          </div>

          <div
            className="rounded-[13px] p-[11px_13px] flex gap-2.5 items-start mb-4"
            style={{ background: 'rgb(var(--accenttint))' }}
          >
            <PhIcon name="ph-fill ph-sparkle" size={15} color="rgb(var(--accent))" className="mt-px flex-shrink-0" />
            <p className="m-0 text-xs leading-[1.5] font-bold" style={{ color: 'rgb(var(--brown))' }}>
              AI: two courtesy reminders always come before any fee (§9). Most notices close
              themselves — 2 neighbors self-cured this month.
            </p>
          </div>

          <button
            type="button"
            onClick={markViolFixed}
            className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer text-white mb-2.5 font-sans"
            style={{ background: 'rgb(var(--sagedark))', minHeight: 44 }}
          >
            I&apos;ve taken care of it
          </button>
          <button
            type="button"
            onClick={violMsgBoard}
            className="w-full bg-transparent rounded-[14px] py-3 text-[13px] font-extrabold cursor-pointer text-navy font-sans"
            style={{ border: '1.5px solid rgb(var(--navy) / 0.15)', minHeight: 44 }}
          >
            Something&apos;s off? Message the board privately
          </button>
        </div>
      ) : (
        <div className="text-center pt-1.5 pb-1 animate-fadeup">
          <div className="flex justify-center">
            <PhIcon name="ph-fill ph-check-circle" size={48} color="rgb(var(--sage))" />
          </div>
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-xl text-navy">
            Marked fixed. Thanks, neighbor.
          </p>
          <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
            The board confirms on their next walk-through — then #V-31 closes with no record and no
            fee.
          </p>
          <button
            type="button"
            onClick={closeViol}
            className="w-full border-none text-mist rounded-2xl py-3.5 text-sm font-extrabold cursor-pointer bg-skydeep font-sans"
            style={{ minHeight: 44 }}
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
