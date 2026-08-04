import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { usePavStore } from '../store/store';

const PASS_DURS = ['Tonight', '24 hours', 'Weekend'];

/** Guest pass sheet — ported from prototype lines 2268-2313. */
export function PassSheet() {
  const state = usePavStore();
  const { set, issuePass } = state;

  const canPass = !!state.passName.trim() && !!state.passPlate.trim();
  const closePass = () => set({ passOpen: false });

  return (
    <Sheet
      label="Guest and parking pass"
      open={state.passOpen} onClose={closePass}>
      {!state.passIssued ? (
        <div>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">Guest pass</p>
          <p className="m-0 mb-4 text-xs font-bold" style={{ color: 'rgb(var(--stone))' }}>
            Gate + Lot B parking · the camera reads the plate, no paper needed.
          </p>
          <input
            value={state.passName}
            onChange={(e) => set({ passName: e.target.value })}
            placeholder="Guest name"
            className="w-full bg-paper rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans mb-2.5"
            style={{ border: '1px solid rgb(var(--navy) / 0.12)' }}
          />
          <input
            value={state.passPlate}
            onChange={(e) => set({ passPlate: e.target.value })}
            placeholder="License plate"
            className="w-full bg-paper rounded-[13px] px-3.5 py-3 text-[13.5px] font-bold text-navy outline-none font-sans mb-3.5"
            style={{ border: '1px solid rgb(var(--navy) / 0.12)' }}
          />
          <p
            className="m-0 mb-2 text-[11px] font-bold uppercase text-stone"
            style={{ letterSpacing: '0.12em' }}
          >
            How long?
          </p>
          <div className="flex gap-1.5 mb-4">
            {PASS_DURS.map((label, i) => {
              const on = state.passDur === i;
              return (
                <button
                  key={label}
                  onClick={() => set({ passDur: i })}
                  className="flex-1 rounded-xl py-2.5 text-xs font-extrabold cursor-pointer"
                  style={{
                    border: on ? '1px solid rgb(var(--navy))' : '1px solid rgb(var(--navy) / 0.12)',
                    background: on ? 'rgb(var(--navy))' : 'rgb(var(--paper))',
                    color: on ? 'rgb(var(--cream))' : 'rgb(var(--bark))',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <button
            onClick={issuePass}
            className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold"
            style={{
              background: canPass ? 'rgb(var(--ember))' : 'rgb(var(--sandpale))',
              color: canPass ? 'rgb(var(--white))' : 'rgb(var(--stonelight))',
              cursor: canPass ? 'pointer' : 'default',
            }}
          >
            Issue pass
          </button>
        </div>
      ) : (
        <div className="animate-fadeup">
          <div className="rounded-[20px] p-[18px] flex gap-4 items-center mb-3.5 bg-navy text-cream">
            <div
              className="w-[92px] h-[92px] bg-paper rounded-[14px] p-2.5 grid flex-shrink-0"
              style={{ gridTemplateColumns: 'repeat(5,1fr)', gridTemplateRows: 'repeat(5,1fr)', gap: 3 }}
            >
              {[1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1].map((on, i) => (
                <span key={i} style={{ background: on ? 'rgb(var(--navy))' : undefined, borderRadius: 2 }} />
              ))}
            </div>
            <div className="min-w-0">
              <p
                className="m-0 mb-[3px] text-[11px] font-bold uppercase"
                style={{ letterSpacing: '0.12em', color: 'rgb(var(--peach))' }}
              >
                Pass JR-0142
              </p>
              <p className="m-0 mb-[3px] font-serif text-[17px] leading-[1.25]">
                {state.passName} · {state.passPlate}
              </p>
              <p className="m-0 text-xs font-bold" style={{ color: 'rgb(var(--cream) / 0.65)' }}>
                {PASS_DURS[state.passDur]} · Lot B · expires automatically
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => set({ passTexted: true })}
              className="flex-1 bg-transparent rounded-[13px] py-3 text-[13px] font-extrabold cursor-pointer text-navy flex items-center justify-center gap-1.5"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-fill ph-chat-teardrop-text" size={15} />
              {state.passTexted ? 'Sent ✓' : 'Text to guest'}
            </button>
            <button
              onClick={closePass}
              className="flex-1 border-none text-cream rounded-[13px] py-3 text-[13px] font-extrabold cursor-pointer bg-navy"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
