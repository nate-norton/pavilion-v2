import { PhIcon } from '../components/PhIcon';
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

  const closeArc = () => set({ arcSheetOpen: false });
  const canSubmit = !!state.arcType;
  const submit = () => {
    if (!canSubmit) return;
    if (repo.isDemo()) { submitArc(); return; }
    void repo.createArcRequest({ type: state.arcType ?? 'Exterior update', description: state.arcDesc })
      .then(() => set({ arcSheetOpen: false, arcDesc: '', arcType: null }))
      .catch(() => {}); // failure surfaced via the app toast

  };

  return (
    <Sheet open={state.arcSheetOpen} onClose={closeArc} maxHeight="86%">
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
        className="w-full bg-[rgb(var(--paper))] rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans resize-none mb-4"
        style={{ minHeight: 72, border: '1px solid rgb(var(--navy) / 0.12)' }}
      />

      <p
        className="m-0 mb-2 text-[11px] font-bold uppercase text-stone"
        style={{ letterSpacing: '0.12em' }}
      >
        Photos
      </p>
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

      {repo.isDemo() && (
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

      <button
        onClick={submit}
        className="w-full border-none rounded-2xl py-4 text-[15px] font-extrabold font-sans"
        style={{
          background: canSubmit ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))',
          color: canSubmit ? 'rgb(var(--white))' : 'rgb(var(--stonelight))',
          cursor: canSubmit ? 'pointer' : 'default',
        }}
      >
        {canSubmit ? 'Submit to the board' : 'Pick a project type'}
      </button>
    </Sheet>
  );
}
