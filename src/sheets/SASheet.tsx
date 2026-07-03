import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { usePavStore } from '../store/store';

/** Special-assessment sheet — ported from prototype lines 2405-2445. */
export function SASheet() {
  const state = usePavStore();
  const { set } = state;

  const closeSA = () => set({ saSheetOpen: false });
  const paySA = () => set({ saPaid: true });
  const startSAPlan = () => set({ saPlan: true });

  const notSaPaid = !state.saPaid && !state.saPlan;
  const saPlanConfirm = state.saPlan && !state.saPaid;
  const saPaid = state.saPaid;

  return (
    <Sheet open={state.saSheetOpen} onClose={closeSA} maxHeight="88%">
      {notSaPaid && (
        <div>
          <p className="m-0 mb-0.5 font-serif text-[22px] text-navy">Roof-reserve assessment</p>
          <p className="m-0 mb-3.5 text-[12.5px] font-semibold" style={{ color: '#8A8375' }}>
            One-time · #27 Alder Way · approved 91–22 on Jun 18
          </p>
          <div
            className="rounded-2xl p-[15px] mb-3 bg-[#FFFEFA]"
            style={{ border: '1px solid rgba(26,51,82,0.1)' }}
          >
            <div className="flex items-baseline justify-between mb-2.5">
              <span className="text-[13px] font-bold" style={{ color: '#5B554A' }}>
                Your share
              </span>
              <span className="font-serif text-[28px] text-navy">
                $450
                <span className="text-base">.00</span>
              </span>
            </div>
            <p className="m-0 text-xs leading-[1.55] font-semibold" style={{ color: '#8A8375' }}>
              The 2026 reserve study flagged the clubhouse roof at end-of-life. This one-time
              assessment funds replacement without touching monthly dues.{' '}
              <span className="font-extrabold" style={{ color: '#3A73B5' }}>
                Reserve study →
              </span>
            </p>
          </div>
          <div
            className="flex items-center gap-2.5 rounded-[13px] p-[11px_13px] mb-4"
            style={{ background: '#EAF3FD' }}
          >
            <PhIcon
              name="ph-fill ph-calendar-dots"
              size={16}
              color="#3A73B5"
              className="flex-shrink-0"
            />
            <p className="m-0 text-xs font-bold" style={{ color: '#3A6491' }}>
              Due Aug 1 — or spread it interest-free across 3 months.
            </p>
          </div>
          <button
            onClick={paySA}
            className="w-full border-none rounded-2xl py-4 text-[15px] font-extrabold cursor-pointer text-white mb-2.5"
            style={{ background: '#E06A3E' }}
          >
            Pay $450.00
          </button>
          <button
            onClick={startSAPlan}
            className="w-full bg-transparent rounded-[14px] py-[13px] text-[13.5px] font-extrabold cursor-pointer text-navy"
            style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
          >
            Split into 3 × $150 — interest-free
          </button>
        </div>
      )}
      {saPlanConfirm && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-calendar-check" size={52} color="#2A9D5C" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-[22px] text-navy">
            Assessment plan set.
          </p>
          <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: '#8A8375' }}>
            3 × $150 · Aug 1, Sep 1, Oct 1 · autopay from Juniper CU ····4821
          </p>
          <button
            onClick={closeSA}
            className="w-full border-none text-cream rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer bg-navy"
          >
            Done
          </button>
        </div>
      )}
      {saPaid && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-check-circle" size={52} color="#2A9D5C" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-[22px] text-navy">
            Paid in full — thank you.
          </p>
          <p className="m-0 mb-4 text-[13px] font-semibold" style={{ color: '#8A8375' }}>
            $450.00 · receipt #S-118 · Juniper CU ····4821
          </p>
          <button
            onClick={closeSA}
            className="w-full border-none text-cream rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer bg-navy"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
