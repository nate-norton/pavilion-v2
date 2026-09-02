import { useId, useRef, useState } from 'react';
import { reportedByDataLayer } from '../lib/errorBus';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { Hint } from '../components/Hint';
import { Sheet } from '../components/Sheet';
import { Chip } from '../components/Chip';
import { usePavStore } from '../store/store';
import { useArcTypes, useRepository } from '../data/repo';

/** The label above a non-input control, matching Field's own label. */
const LABEL = 'block mb-1.5 text-[12.5px] font-bold text-slatedark';

const TILE_EMPTY = {
  border: '1.5px dashed rgb(var(--navy) / 0.2)',
  background: 'repeating-linear-gradient(-45deg,rgb(var(--mistdim)) 0 8px,rgb(var(--mistpale)) 8px 16px)',
} as const;
const TILE_FILLED = {
  border: '1.5px solid rgb(var(--sage) / 0.4)',
  background: 'rgb(var(--mint))',
} as const;

/** ARC request sheet — ported from prototype lines 1358-1397. */
export function ArcSheet() {
  const state = usePavStore();
  const { set, submitArc } = state;
  const ARC_TYPES = useArcTypes();
  const repo = useRepository();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const typeLabelId = useId();
  const photosLabelId = useId();

  const closeArc = () => set({ arcSheetOpen: false });
  const canSubmit = !!state.arcType && !busy;
  const submit = () => {
    if (!canSubmit) return;
    if (repo.isDemo()) { submitArc(); return; }
    setBusy(true);
    void repo.createArcRequest({ type: state.arcType ?? 'Exterior update', description: state.arcDesc, attachments })
      .then(() => { set({ arcSheetOpen: false, arcDesc: '', arcType: null }); setAttachments([]); })
      .catch(reportedByDataLayer)
      .finally(() => setBusy(false));
  };
  const demo = repo.isDemo();
  const fileCount = attachments.length;

  return (
    <Sheet
      label="New architectural request"
      open={state.arcSheetOpen} onClose={closeArc} maxHeight="86%">
      <p className="m-0 mb-0.5 font-serif text-xl text-navy">New ARC request</p>
      {/*
        The demo's "7 days" is a scripted promise about Juniper Ridge. Live
        has no turnaround data to back a number, so it says what the app can
        actually guarantee: that every step shows up here.
      */}
      <p className="m-0 mb-4 text-[12.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
        {demo ? 'Most requests get a decision within 7 days.' : 'Your board reviews it and you see every step here.'}
      </p>

      <span id={typeLabelId} className={LABEL}>Project type</span>
      <div className="flex gap-1.5 flex-wrap mb-4" role="group" aria-labelledby={typeLabelId}>
        {ARC_TYPES.map((label) => (
          <Chip
            key={label}
            label={label}
            active={state.arcType === label}
            onClick={() => set({ arcType: label })}
            size="md"
          />
        ))}
      </div>

      <Field
        as="textarea"
        label="Describe the change"
        value={state.arcDesc}
        onChange={(e) => set({ arcDesc: e.target.value })}
        placeholder="e.g. Repaint front door in Sage, per the approved palette"
        maxLength={2000}
        rows={3}
        className="mb-4"
      />

      <span id={photosLabelId} className={LABEL}>Photos</span>
      {/* Live: real files (plans, photos, paint chips). Demo: scripted toggles. */}
      {!demo && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf"
            multiple
            className="hidden"
            onChange={(e) => setAttachments([...attachments, ...Array.from(e.target.files ?? [])].slice(0, 6))}
          />
          <button
            type="button"
            aria-labelledby={photosLabelId}
            aria-describedby={`${photosLabelId}-hint`}
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 cursor-pointer font-sans"
            style={{ minHeight: 70, borderRadius: 13, ...(fileCount ? TILE_FILLED : TILE_EMPTY) }}
          >
            <PhIcon name={fileCount ? 'ph-fill ph-check-circle' : 'ph ph-camera-plus'} size={18} color={fileCount ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))'} />
            <span className="text-[12.5px] font-bold" style={{ color: fileCount ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))' }}>
              {fileCount ? `${fileCount} file${fileCount > 1 ? 's' : ''} added · tap to add more` : 'Add photos or plans'}
            </span>
          </button>
          <p id={`${photosLabelId}-hint`} className="m-0 mt-1.5 mb-4 text-[12px] font-semibold text-slate leading-[1.4]">
            Photos, plans or paint chips · PDF is fine · up to 6
          </p>
        </>
      )}
      {demo && (
      <div className="grid grid-cols-2 gap-2.5 mb-4" role="group" aria-labelledby={photosLabelId}>
        <button
          type="button"
          onClick={() => set({ arcPhoto1: true })}
          className="flex flex-col items-center justify-center gap-1 cursor-pointer font-sans"
          style={{ height: 76, borderRadius: 13, ...(state.arcPhoto1 ? TILE_FILLED : TILE_EMPTY) }}
        >
          <PhIcon name={state.arcPhoto1 ? 'ph-fill ph-check-circle' : 'ph ph-camera-plus'} size={19} color={state.arcPhoto1 ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))'} />
          <span className="text-[12.5px] font-bold" style={{ color: state.arcPhoto1 ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))' }}>
            {state.arcPhoto1 ? 'Added' : 'Current state'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => set({ arcPhoto2: true })}
          className="flex flex-col items-center justify-center gap-1 cursor-pointer font-sans"
          style={{ height: 76, borderRadius: 13, ...(state.arcPhoto2 ? TILE_FILLED : TILE_EMPTY) }}
        >
          <PhIcon name={state.arcPhoto2 ? 'ph-fill ph-check-circle' : 'ph ph-image-square'} size={19} color={state.arcPhoto2 ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))'} />
          <span className="text-[12.5px] font-bold" style={{ color: state.arcPhoto2 ? 'rgb(var(--sagedark))' : 'rgb(var(--slatedark))' }}>
            {state.arcPhoto2 ? 'Added' : 'Plan / inspiration'}
          </span>
        </button>
      </div>
      )}

      {demo && (
      <div
        className="rounded-[13px] p-[11px_13px] flex gap-2.5 items-start mb-4"
        style={{ background: 'rgb(var(--accenttint))' }}
      >
        <PhIcon name="ph-fill ph-sparkle" size={15} color="rgb(var(--accent))" className="mt-px flex-shrink-0" />
        <p className="m-0 text-xs leading-[1.5] font-bold" style={{ color: 'rgb(var(--brown))' }}>
          AI: Sage &amp; Clay are pre-approved paint colors (CC&amp;Rs §4.2) — those requests are
          usually fast-tracked.
        </p>
      </div>
      )}

      <div className="mb-3">
        <Hint label="What happens after I submit?">
          The board reviews it and either approves, declines, or asks for more
          detail — you will see each step here. Start the work before approval
          and you may be asked to undo it at your own cost, so it is worth the
          wait.
        </Hint>
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={!canSubmit}
        aria-busy={busy}
        className="w-full border-none rounded-2xl py-4 text-[14px] font-extrabold font-sans"
        style={{
          background: canSubmit ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
          color: canSubmit ? 'rgb(var(--white))' : 'rgb(var(--slatedark))',
          cursor: canSubmit ? 'pointer' : 'default',
          minHeight: 44,
        }}
      >
        {busy ? 'Sending…' : canSubmit ? 'Submit to the board' : 'Pick a project type'}
      </button>
    </Sheet>
  );
}
