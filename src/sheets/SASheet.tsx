import { Card } from '../components/Card';
import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { useRepository } from '../data/repo';
import { usePavStore } from '../store/store';

/** Special-assessment sheet — ported from prototype lines 2405-2445. */
export function SASheet() {
  const state = usePavStore();
  const { set } = state;
  // Scripted amount, bank and receipt — must never render in live. A live
  // unit's open assessment is shown from its real row on My Place instead.
  if (!useRepository().isDemo()) return null;

  const closeSA = () => set({ saSheetOpen: false });
  const paySA = () => set({ saPaid: true });
  const startSAPlan = () => set({ saPlan: true });

  const notSaPaid = !state.saPaid && !state.saPlan;
  const saPlanConfirm = state.saPlan && !state.saPaid;
  const saPaid = state.saPaid;

  return (
    <Sheet
      label="Special assessment"
      open={state.saSheetOpen} onClose={closeSA} maxHeight="88%">
      {notSaPaid && (
        <div>
          <h2 className="m-0 mb-0.5 font-serif font-normal text-[19px] text-navy">Roof-reserve assessment</h2>
          <p className="m-0 mb-3.5 text-[12.5px] font-bold text-slate">
            One-time · #27 Alder Way · approved 91–22 on Jun 18
          </p>
          <Card className="mb-3">
            <div className="flex items-baseline justify-between mb-2.5">
              <span className="text-[13px] font-bold text-slatedark">
                Your share
              </span>
              <span className="font-serif text-[24px] text-navy">
                $450
                <span className="text-base">.00</span>
              </span>
            </div>
            <p className="m-0 text-[12.5px] leading-[1.55] font-bold text-slate">
              The 2026 reserve study flagged the clubhouse roof at end-of-life. This one-time
              assessment funds replacement without touching monthly dues.{' '}
              <button
                type="button"
                onClick={() => set({ saSheetOpen: false, docsOpen: true, docReader: true, docReaderKey: 'reserve' })}
                className="inline border-none bg-transparent p-0 font-bold cursor-pointer font-sans text-[12.5px] underline underline-offset-2"
                style={{ color: 'rgb(var(--skydeep))' }}
              >
                Reserve study
              </button>
            </p>
          </Card>
          <div
            className="flex items-center gap-2.5 rounded-[13px] p-[11px_13px] mb-4"
            style={{ background: 'rgb(var(--skypale))' }}
          >
            <PhIcon
              name="ph-fill ph-calendar-dots"
              size={16}
              color="rgb(var(--skydeep))"
              className="flex-shrink-0"
            />
            <p className="m-0 text-[12.5px] font-bold" style={{ color: 'rgb(var(--skydark))' }}>
              Due Aug 1 — or spread it interest-free across 3 months.
            </p>
          </div>
          <button
            onClick={paySA}
            className="w-full border-none rounded-2xl min-h-[52px] text-[14px] font-extrabold cursor-pointer text-white mb-2.5 font-sans"
            style={{ background: 'rgb(var(--skydeep))' }}
          >
            Pay $450.00
          </button>
          <button
            onClick={startSAPlan}
            className="w-full bg-transparent rounded-[14px] min-h-[48px] text-[13.5px] font-extrabold cursor-pointer text-navy font-sans"
            style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
          >
            Split into 3 × $150 — interest-free
          </button>
        </div>
      )}
      {saPlanConfirm && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-calendar-check" size={52} color="rgb(var(--sage))" />
          <h2 className="m-0 mt-2.5 mb-[3px] font-serif font-normal text-[19px] text-navy">
            Assessment plan set.
          </h2>
          <p className="m-0 mb-4 text-[13px] font-bold text-slate">
            3 × $150 · Aug 1, Sep 1, Oct 1 · autopay from Juniper CU ····4821
          </p>
          <button
            onClick={closeSA}
            className="w-full border-none text-mist rounded-2xl min-h-[52px] text-[14.5px] font-extrabold cursor-pointer bg-skydeep font-sans"
          >
            Done
          </button>
        </div>
      )}
      {saPaid && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-check-circle" size={52} color="rgb(var(--sage))" />
          <h2 className="m-0 mt-2.5 mb-[3px] font-serif font-normal text-[19px] text-navy">
            Paid in full — thank you.
          </h2>
          <p className="m-0 mb-4 text-[13px] font-bold text-slate">
            $450.00 · receipt #S-118 · Juniper CU ····4821
          </p>
          <button
            onClick={closeSA}
            className="w-full border-none text-mist rounded-2xl min-h-[52px] text-[14.5px] font-extrabold cursor-pointer bg-skydeep font-sans"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
