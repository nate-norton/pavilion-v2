import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { usePavStore } from '../store/store';
import { ARC_TYPES } from '../data';

/** ARC request sheet — ported from prototype lines 1358-1397. */
export function ArcSheet() {
  const state = usePavStore();
  const { set, submitArc } = state;

  const closeArc = () => set({ arcSheetOpen: false });
  const canSubmit = !!state.arcType;

  return (
    <Sheet open={state.arcSheetOpen} onClose={closeArc} maxHeight="86%">
      <p className="m-0 mb-0.5 font-serif text-xl text-navy">New ARC request</p>
      <p className="m-0 mb-4 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
        Most requests get a decision within 7 days.
      </p>

      <p
        className="m-0 mb-2 text-[11px] font-extrabold uppercase text-stone"
        style={{ letterSpacing: '0.12em' }}
      >
        Project type
      </p>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {ARC_TYPES.map((label) => {
          const on = state.arcType === label;
          return (
            <button
              key={label}
              onClick={() => set({ arcType: label })}
              className="rounded-full px-3.5 py-2 text-[12.5px] font-extrabold cursor-pointer font-sans"
              style={{
                border: on ? '1px solid #1A3352' : '1px solid rgba(26,51,82,0.12)',
                background: on ? '#1A3352' : '#FFFEFA',
                color: on ? '#F5F0E6' : '#5B554A',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p
        className="m-0 mb-2 text-[11px] font-extrabold uppercase text-stone"
        style={{ letterSpacing: '0.12em' }}
      >
        Describe the change
      </p>
      <textarea
        value={state.arcDesc}
        onChange={(e) => set({ arcDesc: e.target.value })}
        placeholder="e.g. Repaint front door in Sage, per the approved palette"
        className="w-full bg-[#FFFEFA] rounded-[13px] px-3.5 py-3 text-[13.5px] font-semibold text-navy outline-none font-sans resize-none mb-4"
        style={{ minHeight: 72, border: '1px solid rgba(26,51,82,0.12)' }}
      />

      <p
        className="m-0 mb-2 text-[11px] font-extrabold uppercase text-stone"
        style={{ letterSpacing: '0.12em' }}
      >
        Photos
      </p>
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <div
          className="flex flex-col items-center justify-center gap-1"
          style={{
            height: 76,
            border: '1.5px dashed rgba(26,51,82,0.2)',
            borderRadius: 13,
            background: 'repeating-linear-gradient(-45deg,#F3EDE0 0 8px,#F9F5EC 8px 16px)',
          }}
        >
          <PhIcon name="ph ph-camera-plus" size={19} color="#8A8375" />
          <span className="font-mono text-[10px]" style={{ color: '#8A8375' }}>
            current state
          </span>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-1"
          style={{
            height: 76,
            border: '1.5px dashed rgba(26,51,82,0.2)',
            borderRadius: 13,
            background: 'repeating-linear-gradient(-45deg,#F3EDE0 0 8px,#F9F5EC 8px 16px)',
          }}
        >
          <PhIcon name="ph ph-image-square" size={19} color="#8A8375" />
          <span className="font-mono text-[10px]" style={{ color: '#8A8375' }}>
            plan / inspiration
          </span>
        </div>
      </div>

      <div
        className="rounded-[13px] p-[11px_13px] flex gap-2.5 items-start mb-4"
        style={{ background: '#FBEDE4' }}
      >
        <PhIcon name="ph-fill ph-sparkle" size={15} color="#C75A31" className="mt-px flex-shrink-0" />
        <p className="m-0 text-xs leading-[1.5] font-bold" style={{ color: '#8A5138' }}>
          Penny: Sage &amp; Clay are pre-approved paint colors (CC&amp;Rs §4.2) — those requests are
          usually fast-tracked.
        </p>
      </div>

      <button
        onClick={submitArc}
        className="w-full border-none rounded-2xl py-4 text-[15px] font-extrabold font-sans"
        style={{
          background: canSubmit ? '#E06A3E' : '#DDD5C2',
          color: canSubmit ? '#fff' : '#A39B8B',
          cursor: canSubmit ? 'pointer' : 'default',
        }}
      >
        {canSubmit ? 'Submit to the board' : 'Pick a project type'}
      </button>
    </Sheet>
  );
}
