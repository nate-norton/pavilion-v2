import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { Chip } from '../components/Chip';
import { usePavStore } from '../store/store';

const REPORT_CHIPS = ['Maintenance', 'Safety', 'Violation concern', 'Noise', 'Other'];

/** Private report sheet — ported from prototype lines 2223-2266. */
export function ReportSheet() {
  const state = usePavStore();
  const { set, submitReport } = state;

  const closeReport = () => set({ reportOpen: false });
  const canReport = !!state.reportType;

  return (
    <Sheet open={state.reportOpen} onClose={closeReport} maxHeight="86%">
      {!state.reportSubmitted ? (
        <div>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">Report a problem</p>
          <p className="m-0 mb-4 text-[12.5px] font-bold" style={{ color: '#8A8375' }}>
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
            className="w-full bg-[#FFFEFA] rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans resize-none mb-3.5"
            style={{ minHeight: 70, border: '1px solid rgba(26,51,82,0.12)' }}
          />

          <button
            type="button"
            onClick={() => set({ reportPhoto: true })}
            className="w-full flex items-center justify-center gap-2 mb-4 cursor-pointer"
            style={{
              height: 70,
              border: state.reportPhoto ? '1.5px solid rgba(42,157,92,0.4)' : '1.5px dashed rgba(26,51,82,0.2)',
              borderRadius: 13,
              background: state.reportPhoto ? '#E9F6EE' : 'repeating-linear-gradient(-45deg,#F3EDE0 0 8px,#F9F5EC 8px 16px)',
            }}
          >
            <PhIcon name={state.reportPhoto ? 'ph-fill ph-check-circle' : 'ph ph-camera-plus'} size={18} color={state.reportPhoto ? '#2A9D5C' : '#8A8375'} />
            <span className="font-mono text-[10px]" style={{ color: state.reportPhoto ? '#228049' : '#8A8375' }}>
              {state.reportPhoto ? 'photo added ✓' : 'add a photo (optional)'}
            </span>
          </button>

          <button
            onClick={submitReport}
            className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold font-sans"
            style={{
              background: canReport ? '#E06A3E' : '#DDD5C2',
              color: canReport ? '#fff' : '#A39B8B',
              cursor: canReport ? 'pointer' : 'default',
            }}
          >
            {canReport ? 'Send privately to the board' : 'Pick a category'}
          </button>
        </div>
      ) : (
        <div className="text-center pt-1.5 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-shield-check" size={48} color="#2A9D5C" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-xl text-navy">Sent — privately.</p>
          <p className="m-0 mb-3.5 text-[13px] font-bold" style={{ color: '#8A8375' }}>
            Ticket #M-89 · {state.reportType} · the board sees it, the feed never does
          </p>
          <div className="flex items-center justify-center gap-0 mb-4">
            <div className="flex flex-col items-center gap-1" style={{ width: 80 }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#2A9D5C' }}
              >
                <PhIcon name="ph-bold ph-check" size={10} color="#fff" />
              </span>
              <span className="text-[10px] font-bold" style={{ color: '#5B554A' }}>
                Submitted
              </span>
            </div>
            <div className="h-0.5" style={{ background: '#D9CFB8', width: 36, marginBottom: 16 }} />
            <div className="flex flex-col items-center gap-1" style={{ width: 80 }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#D9A441' }}
              >
                <PhIcon name="ph-bold ph-hourglass" size={10} color="#fff" />
              </span>
              <span className="text-[10px] font-bold" style={{ color: '#5B554A' }}>
                Triage
              </span>
            </div>
            <div className="h-0.5" style={{ background: '#D9CFB8', width: 36, marginBottom: 16 }} />
            <div className="flex flex-col items-center gap-1" style={{ width: 80 }}>
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: '#D9CFB8' }}
              >
                <PhIcon name="ph-bold ph-dots-three" size={10} color="#fff" />
              </span>
              <span className="text-[10px] font-bold" style={{ color: '#5B554A' }}>
                Fixed
              </span>
            </div>
          </div>
          <p className="m-0 mb-3.5 text-xs font-bold" style={{ color: '#8A8375' }}>
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
