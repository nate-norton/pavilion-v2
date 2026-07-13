import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { Toggle } from '../components/Toggle';
import { Confetti } from '../components/Confetti';
import { usePavStore } from '../store/store';
import { getDelinquent } from '../store/selectors';

/** Pay-dues sheet — ported from prototype lines 1280-1356. */
export function PaySheet() {
  const state = usePavStore();
  const { set } = state;
  const delinquent = usePavStore(getDelinquent);

  const closePay = () => set({ paySheetOpen: false });
  const doPay = () => set({ paid: true });
  const startPlan = () => set({ planActive: true });
  const toggleAutopay = () => set({ autopay: !state.autopay });

  const notPaid = !state.paid && !state.planActive;
  const planConfirm = state.planActive && !state.paid;
  const paid = state.paid;

  const payTitle = delinquent ? 'June + July assessments' : 'July assessment';
  const payAmtMain = delinquent ? '$570' : '$285';
  const payBtnLabel = delinquent ? 'Pay $570.00 now' : 'Pay $285.00';

  return (
    <Sheet open={state.paySheetOpen} onClose={closePay}>
      {notPaid && (
        <div>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">{payTitle}</p>
          <p className="m-0 mb-3.5 text-[12.5px] font-bold" style={{ color: '#8A8375' }}>
            #27 Alder Way · due Jul 3
          </p>
          {delinquent && (
            <div
              className="rounded-[13px] p-[11px_13px] flex gap-2.5 items-start mb-3"
              style={{ background: '#FBEDE4', border: '1px solid rgba(199,90,49,0.25)' }}
            >
              <PhIcon
                name="ph-fill ph-clock-countdown"
                size={16}
                color="#C75A31"
                className="mt-px flex-shrink-0"
              />
              <p className="m-0 text-xs leading-[1.5] font-bold" style={{ color: '#8A5138' }}>
                June is 30 days past due. You're in the courtesy period — no fees, no interest
                (§9). A payment plan keeps it that way.
              </p>
            </div>
          )}
          <p className="m-0 mb-3.5 font-serif text-[36px] text-navy">
            {payAmtMain}
            <span className="text-xl">.00</span>
          </p>
          <div className="flex h-2.5 rounded-full overflow-hidden mb-2">
            <div style={{ width: '27%', background: '#2A9D5C' }} />
            <div style={{ width: '25%', background: '#1A3352' }} />
            <div style={{ width: '19%', background: '#E06A3E' }} />
            <div style={{ width: '17%', background: '#D9A441' }} />
            <div style={{ width: '12%', background: '#A39B8B' }} />
          </div>
          <p className="m-0 mb-4 text-[11.5px] font-bold" style={{ color: '#8A8375' }}>
            Landscaping $78 · Reserves $71 · Insurance $54 · Utilities $48 · Mgmt $34
          </p>
          <div
            className="rounded-[14px] p-[13px_14px] flex items-center gap-2.5 mb-2.5 bg-[#FFFEFA]"
            style={{ border: '1px solid rgba(26,51,82,0.1)' }}
          >
            <PhIcon name="ph-fill ph-bank" size={20} color="#1A3352" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 text-[13px] font-bold text-navy">
                Juniper Credit Union ····4821
              </p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
                No card fees — ACH is free
              </p>
            </div>
            <span className="text-xs font-bold" style={{ color: '#4A90E2' }}>
              Change
            </span>
          </div>
          <div
            className="rounded-[14px] p-[13px_14px] flex items-center gap-2.5 mb-4 bg-[#FFFEFA]"
            style={{ border: '1px solid rgba(26,51,82,0.1)' }}
          >
            <PhIcon
              name="ph-fill ph-arrows-clockwise"
              size={20}
              color="#1A3352"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <p className="m-0 text-[13px] font-bold text-navy">Autopay on the 3rd</p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: '#8A8375' }}>
                Never think about dues again
              </p>
            </div>
            <Toggle on={state.autopay} onToggle={toggleAutopay} />
          </div>
          <button
            onClick={doPay}
            className="w-full border-none rounded-2xl py-4 text-[15px] font-extrabold cursor-pointer text-white"
            style={{ background: '#E06A3E' }}
          >
            {payBtnLabel}
          </button>
          {delinquent && (
            <button
              onClick={startPlan}
              className="w-full bg-transparent rounded-[14px] py-[13px] text-[13.5px] font-extrabold cursor-pointer text-navy mt-2.5"
              style={{ border: '1.5px solid rgba(26,51,82,0.15)' }}
            >
              Split into 3 payments of $190 — no fees
            </button>
          )}
        </div>
      )}
      {planConfirm && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-calendar-check" size={52} color="#2A9D5C" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-[22px] text-navy">
            Payment plan is set.
          </p>
          <p className="m-0 mb-3.5 text-[13px] font-bold" style={{ color: '#8A8375' }}>
            3 × $190 · Jul 3, Aug 3, Sep 3 · autopay from Juniper CU ····4821
          </p>
          <div
            className="rounded-[14px] p-3 mb-4 flex items-center justify-center gap-2.5 bg-[#FFFEFA]"
            style={{ border: '1px dashed rgba(26,51,82,0.2)' }}
          >
            <PhIcon name="ph-fill ph-shield-check" size={17} color="#2A9D5C" />
            <span className="text-[12.5px] font-bold text-navy">
              No late fees while the plan is active — the board sees you as current
            </span>
          </div>
          <button
            onClick={closePay}
            className="w-full border-none text-cream rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer bg-navy"
          >
            Done
          </button>
        </div>
      )}
      {paid && (
        <div className="relative text-center pt-2 pb-1 animate-fadeup">
          <Confetti />
          <PhIcon name="ph-fill ph-check-circle" size={52} color="#2A9D5C" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-[22px] text-navy">
            Paid. Done in two taps.
          </p>
          <p className="m-0 mb-4 text-[13px] font-bold" style={{ color: '#8A8375' }}>
            $285.00 · Jul 1, 9:41 AM · Juniper CU ····4821
          </p>
          <div
            className="rounded-[14px] p-3 mb-4 flex items-center justify-center gap-2.5 bg-[#FFFEFA]"
            style={{ border: '1px dashed rgba(26,51,82,0.2)' }}
          >
            <PhIcon name="ph-fill ph-receipt" size={17} color="#1A3352" />
            <span className="text-[13px] font-bold text-navy">
              Receipt #P-2231 · saved to Documents
            </span>
          </div>
          <button
            onClick={closePay}
            className="w-full border-none text-cream rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer bg-navy"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
