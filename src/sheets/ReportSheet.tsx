import { useRef, useState } from 'react';
import { reportedByDataLayer } from '../lib/errorBus';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { Chip } from '../components/Chip';
import { usePavStore } from '../store/store';
import { useRepository } from '../data/repo';

const REPORT_CHIPS = ['Maintenance', 'Safety', 'Violation concern', 'Noise', 'Other'];
const URGENCIES = [
  { key: 'low', label: 'Low' },
  { key: 'normal', label: 'Normal' },
  { key: 'urgent', label: 'Urgent' },
] as const;

const GROUP_LABEL = 'm-0 mb-2 text-[12.5px] font-bold text-slatedark';

/** Private report sheet — ported from prototype lines 2223-2266. */
export function ReportSheet() {
  const reportOpen = usePavStore((s) => s.reportOpen);
  const reportType = usePavStore((s) => s.reportType);
  const reportDesc = usePavStore((s) => s.reportDesc);
  const reportPhoto = usePavStore((s) => s.reportPhoto);
  const reportSubmitted = usePavStore((s) => s.reportSubmitted);
  const set = usePavStore((s) => s.set);
  const submitReport = usePavStore((s) => s.submitReport);
  const repo = useRepository();
  const demo = repo.isDemo();
  const [urgency, setUrgency] = useState('normal');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Live resets the submitted flag on close so the member can file another
  // report later; the demo keeps its scripted one-shot flow.
  const closeReport = () => {
    if (demo) { set({ reportOpen: false }); return; }
    set({ reportOpen: false, reportSubmitted: false, reportType: null });
    setUrgency('normal'); setLocation(''); setPhotos([]);
  };
  const canReport = !!reportType && !busy;
  // A failed write keeps the sheet open with everything typed still in place;
  // the data layer has already shown the member what went wrong.
  const send = () => {
    if (!canReport) return;
    if (demo) { submitReport(); return; }
    setBusy(true);
    void repo.createReport({ kind: reportType ?? 'Other', description: reportDesc, urgency, location, photos })
      .then(() => { set({ reportSubmitted: true, reportDesc: '' }); setPhotos([]); setLocation(''); setUrgency('normal'); })
      .catch(reportedByDataLayer)
      .finally(() => setBusy(false));
  };

  const hasPhoto = demo ? reportPhoto : photos.length > 0;

  return (
    <Sheet
      label="Report a problem to the board"
      open={reportOpen} onClose={closeReport} maxHeight="86%">
      {!reportSubmitted ? (
        <div>
          <h2 className="m-0 mb-0.5 font-serif font-normal text-xl text-navy">Report a problem</h2>
          <p className="m-0 mb-4 text-[12.5px] font-bold text-slate">
            Goes only to the board &amp; manager — never the public feed.
          </p>

          <div role="group" aria-labelledby="report-category" className="mb-4">
            <p id="report-category" className={GROUP_LABEL}>Category</p>
            <div className="flex gap-1.5 flex-wrap">
              {REPORT_CHIPS.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  active={reportType === label}
                  onClick={() => set({ reportType: label })}
                  size="md"
                />
              ))}
            </div>
          </div>

          <Field
            as="textarea"
            label="What's going on?"
            value={reportDesc}
            onChange={(e) => set({ reportDesc: e.target.value })}
            placeholder="e.g. Sprinkler head broken on the Green, spraying the sidewalk"
            maxLength={2000}
            rows={3}
            className="mb-3.5"
          />

          {!demo && (
            <>
              <div role="group" aria-labelledby="report-urgency" className="mb-3.5">
                <p id="report-urgency" className={GROUP_LABEL}>How urgent?</p>
                <div className="flex gap-1.5">
                  {URGENCIES.map((u) => (
                    <Chip key={u.key} label={u.label} active={urgency === u.key} onClick={() => setUrgency(u.key)} size="md" />
                  ))}
                </div>
              </div>
              <Field
                label="Where"
                hint="Optional — e.g. the Green, by the mailboxes"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                maxLength={120}
                className="mb-3.5"
              />
            </>
          )}

          {/* Demo keeps its scripted photo toggle; live attaches real files. */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
            onChange={(e) => setPhotos([...photos, ...Array.from(e.target.files ?? [])].slice(0, 4))}
          />
          <button
            type="button"
            onClick={() => (demo ? set({ reportPhoto: true }) : fileRef.current?.click())}
            className="w-full flex items-center justify-center gap-2 mb-4 cursor-pointer font-sans"
            style={{
              height: 70,
              border: hasPhoto ? '1.5px solid rgb(var(--sage) / 0.4)' : '1.5px dashed rgb(var(--navy) / 0.2)',
              borderRadius: 13,
              background: hasPhoto ? 'rgb(var(--mint))' : 'rgb(var(--mistpale))',
            }}
          >
            <PhIcon name={hasPhoto ? 'ph-fill ph-check-circle' : 'ph ph-camera-plus'} size={18} color={hasPhoto ? 'rgb(var(--sagedark))' : 'rgb(var(--slate))'} />
            <span className="text-[12.5px] font-bold" style={{ color: hasPhoto ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))' }}>
              {demo
                ? (reportPhoto ? 'Photo added ✓' : 'Add a photo (optional)')
                : (photos.length > 0 ? `${photos.length} photo${photos.length > 1 ? 's' : ''} added ✓ · tap to add more` : 'Add a photo (optional)')}
            </span>
          </button>

          <button
            type="button"
            onClick={send}
            aria-disabled={!canReport}
            className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold font-sans"
            style={{
              background: canReport ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
              color: canReport ? 'rgb(var(--white))' : 'rgb(var(--slatedark))',
              cursor: canReport ? 'pointer' : 'default',
            }}
          >
            {busy ? 'Sending…' : canReport ? 'Send privately to the board' : 'Pick a category to send'}
          </button>
        </div>
      ) : (
        <div className="text-center pt-1.5 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-shield-check" size={48} color="rgb(var(--sage))" />
          <h2 className="m-0 mt-2.5 mb-[3px] font-serif font-normal text-xl text-navy">Sent — privately.</h2>
          <p className="m-0 mb-3.5 text-[13px] font-bold text-slate">
            {demo ? 'Ticket #M-89 · ' : ''}{reportType} · the board sees it, the feed never does
          </p>
          <ol className="list-none m-0 p-0 flex items-center justify-center gap-0 mb-4" aria-label="Progress">
            {[
              { label: 'Submitted', icon: 'ph-bold ph-check', bg: 'rgb(var(--sagedark))', done: true },
              { label: 'Triage', icon: 'ph-bold ph-hourglass', bg: 'rgb(var(--golddark))', done: false },
              { label: 'Fixed', icon: 'ph-bold ph-dots-three', bg: 'rgb(var(--skyline))', done: false },
            ].map((step, i) => (
              <li key={step.label} className="flex items-center">
                {i > 0 && <span className="h-0.5" style={{ background: 'rgb(var(--skyline))', width: 36, marginBottom: 18 }} aria-hidden="true" />}
                <span className="flex flex-col items-center gap-1" style={{ width: 80 }} aria-current={step.done ? 'step' : undefined}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: step.bg }}>
                    <PhIcon name={step.icon} size={10} color="rgb(var(--white))" />
                  </span>
                  <span className="text-[12px] font-bold text-slatedark">{step.label}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="m-0 mb-3.5 text-[12.5px] font-bold text-slate">
            Track it anytime in My Place → My requests
          </p>
          <button
            type="button"
            onClick={closeReport}
            className="w-full border-none text-mist rounded-2xl py-3.5 text-sm font-extrabold cursor-pointer bg-skydeep font-sans"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
