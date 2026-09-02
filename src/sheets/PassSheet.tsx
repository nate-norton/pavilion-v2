import { Chip } from '../components/Chip';
import { Field } from '../components/Field';
import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { StackedPanel } from '../components/StackedCard';
import { usePavStore } from '../store/store';

const PASS_DURS = ['Tonight', '24 hours', 'Weekend'];

/**
 * Guest pass sheet — ported from prototype lines 2268-2313. Demo-only: the
 * door to it (Reserve) is gated on `repo.isDemo()`, so the pass number and
 * lot below are scripted, never shown to a live community.
 */
export function PassSheet() {
  const passOpen = usePavStore((s) => s.passOpen);
  const passName = usePavStore((s) => s.passName);
  const passPlate = usePavStore((s) => s.passPlate);
  const passDur = usePavStore((s) => s.passDur);
  const passIssued = usePavStore((s) => s.passIssued);
  const passTexted = usePavStore((s) => s.passTexted);
  const set = usePavStore((s) => s.set);
  const issuePass = usePavStore((s) => s.issuePass);

  const canPass = !!passName.trim() && !!passPlate.trim();
  const closePass = () => set({ passOpen: false });

  return (
    <Sheet
      label="Guest and parking pass"
      open={passOpen} onClose={closePass}>
      {!passIssued ? (
        <div>
          <h2 className="m-0 mb-0.5 font-serif font-normal text-xl text-navy">Guest pass</h2>
          <p className="m-0 mb-4 text-[12.5px] font-bold text-slate">
            Gate + Lot B parking · the camera reads the plate, no paper needed.
          </p>
          <Field
            label="Guest name"
            value={passName}
            onChange={(e) => set({ passName: e.target.value })}
            autoComplete="off"
            className="mb-3"
          />
          <Field
            label="License plate"
            value={passPlate}
            onChange={(e) => set({ passPlate: e.target.value })}
            autoComplete="off"
            autoCapitalize="characters"
            className="mb-3.5"
          />
          <div role="group" aria-labelledby="pass-duration" className="mb-4">
            <p id="pass-duration" className="m-0 mb-2 text-[12.5px] font-bold text-slatedark">How long?</p>
            <div className="flex gap-1.5 flex-wrap">
              {PASS_DURS.map((label, i) => (
                <Chip key={label} label={label} active={passDur === i} onClick={() => set({ passDur: i })} size="md" />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={issuePass}
            aria-disabled={!canPass}
            className="w-full border-none rounded-2xl py-[15px] text-[14.5px] font-extrabold font-sans"
            style={{
              background: canPass ? 'rgb(var(--skydeep))' : 'rgb(var(--skyrule))',
              color: canPass ? 'rgb(var(--white))' : 'rgb(var(--slatedark))',
              cursor: canPass ? 'pointer' : 'default',
            }}
          >
            {canPass ? 'Issue pass' : 'Add a name and plate to issue'}
          </button>
        </div>
      ) : (
        <div className="animate-fadeup">
          <StackedPanel tint="skydeep" className="mb-3.5">
            <div className="flex gap-4 items-center">
              <div
                className="w-[92px] h-[92px] bg-paper rounded-[14px] p-2.5 grid flex-shrink-0"
                style={{ gridTemplateColumns: 'repeat(5,1fr)', gridTemplateRows: 'repeat(5,1fr)', gap: 3 }}
                role="img"
                aria-label="Pass QR code"
              >
                {[1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1].map((on, i) => (
                  <span key={i} style={{ background: on ? 'rgb(var(--navy))' : undefined, borderRadius: 2 }} />
                ))}
              </div>
              <div className="min-w-0">
                <p className="m-0 mb-1 text-[12.5px] font-bold" style={{ color: 'rgb(var(--peach))' }}>
                  Pass JR-0142
                </p>
                <h2 className="m-0 mb-1 font-serif font-normal text-[17px] leading-[1.25] text-mist">
                  {passName} · {passPlate}
                </h2>
                <p className="m-0 text-[12.5px] font-bold" style={{ color: 'rgb(var(--mist) / 0.95)' }}>
                  {PASS_DURS[passDur]} · Lot B · expires automatically
                </p>
              </div>
            </div>
          </StackedPanel>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => set({ passTexted: true })}
              className="flex-1 bg-transparent rounded-[13px] py-3 text-[13px] font-extrabold cursor-pointer text-navy flex items-center justify-center gap-1.5 font-sans min-h-[44px]"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              <PhIcon name="ph-fill ph-chat-teardrop-text" size={15} />
              {passTexted ? 'Sent ✓' : 'Text to guest'}
            </button>
            <button
              type="button"
              onClick={closePass}
              className="flex-1 border-none text-mist rounded-[13px] py-3 text-[13px] font-extrabold cursor-pointer bg-skydeep font-sans min-h-[44px]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
