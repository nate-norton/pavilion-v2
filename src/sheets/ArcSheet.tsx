import { useRef, useState } from 'react';
import { PhIcon } from '../components/PhIcon';
import { Hint } from '../components/Hint';
import { Sheet } from '../components/Sheet';
import { Chip } from '../components/Chip';
import { usePavStore } from '../store/store';
import { useArcTypes, useRepository } from '../data/repo';

/** ARC request sheet — ported from prototype lines 1358-1397. */
export function ArcSheet() {
  const state = usePavStore();
  const { set, submitArc } = state;
  const ARC_TYPES = useArcTypes();
  const repo = useRepository();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const closeArc = () => set({ arcSheetOpen: false });
  const canSubmit = !!state.arcType && !busy;
  const submit = () => {
    if (!canSubmit) return;
    if (repo.isDemo()) { submitArc(); return; }
    setBusy(true);
    void repo.createArcRequest({ type: state.arcType ?? 'Exterior update', description: state.arcDesc, attachments })
      .then(() => { set({ arcSheetOpen: false, arcDesc: '', arcType: null }); setAttachments([]); })
      .catch(() => {}) // failure surfaced via the app toast
      .finally(() => setBusy(false));
  };
  const demo = repo.isDemo();

  return (
    <Sheet
      label="New architectural request"
      open={state.arcSheetOpen} onClose={closeArc} maxHeight="86%">
      <p className="m-0 mb-0.5 font-serif text-xl text-navy">New ARC request</p>
      <p className="m-0 mb-4 text-[12.5px] font-bold" style={{ color: 'rgb(var(--stone))' }}>
        Most requests get a decision within 7 days.
      </p>

      <p
        className="m-0 mb-2 text-[11px] font-bold uppercase text-stone"
        style={{ letterSpacing: '0.12em' }}
      >
        Project type
      </p>
      <div className="flex gap-1.5 flex-wrap mb-4">
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

      <p
        className="m-0 mb-2 text-[11px] font-bold uppercase text-stone"
        style={{ letterSpacing: '0.12em' }}
      >
        Describe the change
      </p>
      <textarea
        value={state.arcDesc}
        onChange={(e) => set({ arcDesc: e.target.value })}
        placeholder="e.g. Repaint front door in Sage, per the approved palette"
        maxLength={2000}
        className="w-full bg-[rgb(var(--paper))] rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans resize-none mb-4"
        style={{ minHeight: 72, border: '1px solid rgb(var(--navy) / 0.12)' }}
      />

      <p
        className="m-0 mb-2 text-[11px] font-bold uppercase text-stone"
        style={{ letterSpacing: '0.12em' }}
      >
        Photos
      </p>
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
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 mb-4 cursor-pointer"
            style={{
              height: 70,
              border: attachments.length ? '1.5px solid rgb(var(--sage) / 0.4)' : '1.5px dashed rgb(var(--navy) / 0.2)',
              borderRadius: 13,
              background: attachments.length ? 'rgb(var(--mint))' : 'repeating-linear-gradient(-45deg,rgb(var(--creamdim)) 0 8px,rgb(var(--parchment)) 8px 16px)',
            }}
          >
            <PhIcon name={attachments.length ? 'ph-fill ph-check-circle' : 'ph ph-camera-plus'} size={18} color={attachments.length ? 'rgb(var(--sage))' : 'rgb(var(--stone))'} />
            <span className="font-mono text-[10px]" style={{ color: attachments.length ? 'rgb(var(--sagedark))' : 'rgb(var(--stone))' }}>
              {attachments.length ? `${attachments.length} file${attachments.length > 1 ? 's' : ''} added ✓ · tap for more` : 'photos, plans, paint chips (PDF ok)'}
            </span>
          </button>
        </>
      )}
      {demo && (
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <button
          type="button"
          onClick={() => set({ arcPhoto1: true })}
          className="flex flex-col items-center justify-center gap-1 cursor-pointer"
          style={{
            height: 76,
            border: state.arcPhoto1 ? '1.5px solid rgb(var(--sage) / 0.4)' : '1.5px dashed rgb(var(--navy) / 0.2)',
            borderRadius: 13,
            background: state.arcPhoto1 ? 'rgb(var(--mint))' : 'repeating-linear-gradient(-45deg,rgb(var(--creamdim)) 0 8px,rgb(var(--parchment)) 8px 16px)',
          }}
        >
          <PhIcon name={state.arcPhoto1 ? 'ph-fill ph-check-circle' : 'ph ph-camera-plus'} size={19} color={state.arcPhoto1 ? 'rgb(var(--sage))' : 'rgb(var(--stone))'} />
          <span className="font-mono text-[10px]" style={{ color: state.arcPhoto1 ? 'rgb(var(--sagedark))' : 'rgb(var(--stone))' }}>
            {state.arcPhoto1 ? 'added ✓' : 'current state'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => set({ arcPhoto2: true })}
          className="flex flex-col items-center justify-center gap-1 cursor-pointer"
          style={{
            height: 76,
            border: state.arcPhoto2 ? '1.5px solid rgb(var(--sage) / 0.4)' : '1.5px dashed rgb(var(--navy) / 0.2)',
            borderRadius: 13,
            background: state.arcPhoto2 ? 'rgb(var(--mint))' : 'repeating-linear-gradient(-45deg,rgb(var(--creamdim)) 0 8px,rgb(var(--parchment)) 8px 16px)',
          }}
        >
          <PhIcon name={state.arcPhoto2 ? 'ph-fill ph-check-circle' : 'ph ph-image-square'} size={19} color={state.arcPhoto2 ? 'rgb(var(--sage))' : 'rgb(var(--stone))'} />
          <span className="font-mono text-[10px]" style={{ color: state.arcPhoto2 ? 'rgb(var(--sagedark))' : 'rgb(var(--stone))' }}>
            {state.arcPhoto2 ? 'added ✓' : 'plan / inspiration'}
          </span>
        </button>
      </div>
      )}

      {demo && (
      <div
        className="rounded-[13px] p-[11px_13px] flex gap-2.5 items-start mb-4"
        style={{ background: 'rgb(var(--blush))' }}
      >
        <PhIcon name="ph-fill ph-sparkle" size={15} color="rgb(var(--terracotta))" className="mt-px flex-shrink-0" />
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
        onClick={submit}
        className="w-full border-none rounded-2xl py-4 text-[14px] font-extrabold font-sans"
        style={{
          background: canSubmit ? 'rgb(var(--emberdeep))' : 'rgb(var(--sandpale))',
          color: canSubmit ? 'rgb(var(--white))' : 'rgb(var(--stonelight))',
          cursor: canSubmit ? 'pointer' : 'default',
        }}
      >
        {canSubmit ? 'Submit to the board' : 'Pick a project type'}
      </button>
    </Sheet>
  );
}
