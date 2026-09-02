import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { Toggle } from '../components/Toggle';
import { usePavStore } from '../store/store';
import { getDelinquent } from '../store/selectors';
import { useRepository } from '../data/repo';

/** Pay-dues sheet — ported from prototype lines 1280-1356. */
export function PaySheet() {
  const state = usePavStore();
  const { set } = state;
  const delinquent = usePavStore(getDelinquent);
  // Scripted amounts and payment method — must never render in live.
  if (!useRepository().isDemo()) return null;

  const closePay = () => set({ paySheetOpen: false });
  const doPay = () => set({ paid: true });
  const startPlan = () => set({ planActive: true });
  const toggleAutopay = () => set({ autopay: !state.autopay });

  const notPaid = !state.paid && !state.planActive;
  const planConfirm = state.planActive && !state.paid;
  const paid = state.paid;

  const payTitle = delinquent ? 'June + July assessments' : 'July assessment';
  const payAmtMain = delinquent ? '$570' : '$285';
  // The label names everything the tap commits to. If autopay is on, this is
  // two commitments — a payment and a standing mandate — and the control that
  // makes them should say so.
  const payAmountLabel = delinquent ? 'Pay $570.00 now' : 'Pay $285.00';
  const payBtnLabel = state.autopay ? `${payAmountLabel} and turn on autopay` : payAmountLabel;

  return (
    <Sheet
      label="Pay your assessment"
      open={state.paySheetOpen} onClose={closePay}>
      {notPaid && (
        <div>
          <p className="m-0 mb-0.5 font-serif text-xl text-navy">{payTitle}</p>
          <p className="m-0 mb-3.5 text-[12.5px] font-bold" style={{ color: 'rgb(var(--slate))' }}>
            #27 Alder Way · due Jul 3
          </p>
          {delinquent && (
            <div
              className="rounded-[13px] p-[11px_13px] flex gap-2.5 items-start mb-3"
              style={{ background: 'rgb(var(--accenttint))', border: '1px solid rgb(var(--accent) / 0.25)' }}
            >
              <PhIcon
                name="ph-fill ph-clock-countdown"
                size={16}
                color="rgb(var(--accent))"
                className="mt-px flex-shrink-0"
              />
              <p className="m-0 text-xs leading-[1.5] font-bold" style={{ color: 'rgb(var(--brown))' }}>
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
            <div style={{ width: '27%', background: 'rgb(var(--sage))' }} />
            <div style={{ width: '25%', background: 'rgb(var(--skydeep))' }} />
            <div style={{ width: '19%', background: 'rgb(var(--sunset))' }} />
            <div style={{ width: '17%', background: 'rgb(var(--gold))' }} />
            <div style={{ width: '12%', background: 'rgb(var(--slatelight))' }} />
          </div>
          <p className="m-0 mb-4 text-[11.5px] font-bold" style={{ color: 'rgb(var(--slate))' }}>
            Landscaping $78 · Reserves $71 · Insurance $54 · Utilities $48 · Mgmt $34
          </p>
          <button
            type="button"
            className="w-full border-none font-sans text-left rounded-[14px] p-[13px_14px] flex items-center gap-2.5 mb-2.5 bg-[rgb(var(--paper))] cursor-pointer"
            style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}
            onClick={() => set({ payMethodOpen: !state.payMethodOpen })}
          >
            <PhIcon name="ph-fill ph-bank" size={20} color="rgb(var(--skydeep))" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 text-[13px] font-bold text-navy">
                {state.payMethod === 'jcu' ? 'Juniper Credit Union ····4821' : state.payMethod === 'visa' ? 'Visa ····7923' : 'Apple Pay'}
              </p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
                {state.payMethod === 'jcu' ? 'No card fees — ACH is free' : state.payMethod === 'visa' ? '$2.85 processing fee' : 'No card fees'}
              </p>
            </div>
            <span className="text-xs font-bold" style={{ color: 'rgb(var(--skydeep))' }}>
              Change
            </span>
          </button>
          {state.payMethodOpen && (
            <div className="rounded-[14px] mb-2.5 overflow-hidden animate-fadeup" style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}>
              {[
                { key: 'jcu', label: 'Juniper Credit Union ····4821', sub: 'ACH · free', icon: 'ph-fill ph-bank' },
                { key: 'visa', label: 'Visa ····7923', sub: '$2.85 fee', icon: 'ph-fill ph-credit-card' },
                { key: 'apple', label: 'Apple Pay', sub: 'No fee', icon: 'ph-fill ph-apple-logo' },
              ].map((pm) => (
                <button
                  type="button"
                  key={pm.key}
                  onClick={() => set({ payMethod: pm.key, payMethodOpen: false })}
                  className="w-full border-none font-sans text-left flex items-center gap-2.5 px-3.5 py-3 cursor-pointer bg-[rgb(var(--paper))]"
                  style={{ borderBottom: pm.key !== 'apple' ? '1px solid rgb(var(--navy) / 0.06)' : undefined }}
                >
                  <PhIcon name={pm.icon} size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
                  <div className="flex-1">
                    <p className="m-0 text-[12.5px] font-bold text-navy">{pm.label}</p>
                    <p className="m-0 text-[11px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>{pm.sub}</p>
                  </div>
                  {state.payMethod === pm.key && (
                    <PhIcon name="ph-fill ph-check-circle" size={16} color="rgb(var(--sage))" />
                  )}
                </button>
              ))}
            </div>
          )}
          <div
            className="rounded-[14px] p-[13px_14px] flex items-center gap-2.5 mb-4 bg-[rgb(var(--paper))]"
            style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}
          >
            <PhIcon
              name="ph-fill ph-arrows-clockwise"
              size={20}
              color="rgb(var(--skydeep))"
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <p className="m-0 text-[13px] font-bold text-navy">Autopay on the 3rd</p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
                Never think about dues again
              </p>
            </div>
            <Toggle on={state.autopay} onToggle={toggleAutopay} label="Autopay — charge this account automatically on the 3rd of each month" />
          </div>
          <button
            onClick={doPay}
            className="w-full border-none rounded-2xl py-4 text-[14px] font-extrabold cursor-pointer text-white"
            style={{ background: 'rgb(var(--skydeep))' }}
          >
            {payBtnLabel}
          </button>
          {state.autopay && (
            <p className="m-0 mt-2 text-[11.5px] font-semibold text-center" style={{ color: 'rgb(var(--slate))' }}>
              Autopay charges this account on the 3rd of each month. Cancel any time in My Place.
            </p>
          )}
          {delinquent && (
            <button
              onClick={startPlan}
              className="w-full bg-transparent rounded-[14px] py-[13px] text-[13.5px] font-extrabold cursor-pointer text-navy mt-2.5"
              style={{ border: '1.5px solid rgb(var(--navy) / 0.15)' }}
            >
              Split into 3 payments of $190 — no fees
            </button>
          )}
        </div>
      )}
      {planConfirm && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-calendar-check" size={52} color="rgb(var(--sage))" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-[19px] text-navy">
            Payment plan is set.
          </p>
          <p className="m-0 mb-3.5 text-[13px] font-bold" style={{ color: 'rgb(var(--slate))' }}>
            3 × $190 · Jul 3, Aug 3, Sep 3 · autopay from Juniper CU ····4821
          </p>
          <div
            className="rounded-[14px] p-3 mb-4 flex items-center justify-center gap-2.5 bg-[rgb(var(--paper))]"
            style={{ border: '1px dashed rgb(var(--navy) / 0.2)' }}
          >
            <PhIcon name="ph-fill ph-shield-check" size={17} color="rgb(var(--sage))" />
            <span className="text-[12.5px] font-bold text-navy">
              No late fees while the plan is active — the board sees you as current
            </span>
          </div>
          <button
            onClick={closePay}
            className="w-full border-none text-mist rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer bg-skydeep"
          >
            Done
          </button>
        </div>
      )}
      {paid && (
        <div className="relative text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-check-circle" size={52} color="rgb(var(--sage))" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-[19px] text-navy">
            Paid. Done in two taps.
          </p>
          <p className="m-0 mb-4 text-[13px] font-bold" style={{ color: 'rgb(var(--slate))' }}>
            $285.00 · Jul 1, 9:41 AM · Juniper CU ····4821
          </p>
          <div
            className="rounded-[14px] p-3 mb-4 flex items-center justify-center gap-2.5 bg-[rgb(var(--paper))]"
            style={{ border: '1px dashed rgb(var(--navy) / 0.2)' }}
          >
            <PhIcon name="ph-fill ph-receipt" size={17} color="rgb(var(--skydeep))" />
            <span className="text-[13px] font-bold text-navy">
              Receipt #P-2231 · saved to Documents
            </span>
          </div>
          <button
            onClick={closePay}
            className="w-full border-none text-mist rounded-2xl py-[15px] text-[14.5px] font-extrabold cursor-pointer bg-skydeep"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
