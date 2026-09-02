import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { Toggle } from '../components/Toggle';
import { usePavStore } from '../store/store';
import { getDelinquent } from '../store/selectors';
import { useRepository } from '../data/repo';
import { DUES_CATEGORIES } from '../lib/dues';

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
          <h2 className="m-0 mb-0.5 font-serif font-normal text-[19px] text-navy">{payTitle}</h2>
          <p className="m-0 mb-3.5 text-[12.5px] font-bold text-slate">
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
              <p className="m-0 text-[12.5px] leading-[1.5] font-bold" style={{ color: 'rgb(var(--brown))' }}>
                June is 30 days past due. You're in the courtesy period — no fees, no interest
                (§9). A payment plan keeps it that way.
              </p>
            </div>
          )}
          <p className="m-0 mb-3.5 font-serif text-[36px] text-navy" style={{ letterSpacing: '-0.02em' }}>
            {payAmtMain}
            <span className="text-xl">.00</span>
          </p>
          {/* One palette for the five categories, shared with PaymentDetailSheet. */}
          <div className="flex h-2.5 rounded-full overflow-hidden mb-2" aria-hidden="true">
            {DUES_CATEGORIES.map((d) => (
              <div key={d.label} style={{ width: `${d.pct}%`, background: d.color }} />
            ))}
          </div>
          <p className="m-0 mb-4 text-[12px] font-bold text-slate">
            {DUES_CATEGORIES.map((d) => `${d.label === 'Management' ? 'Mgmt' : d.label} ${d.amount}`).join(' · ')}
          </p>
          <button
            type="button"
            className="w-full border-none font-sans text-left rounded-[14px] p-[13px_14px] flex items-center gap-2.5 mb-2.5 bg-[rgb(var(--paper))] cursor-pointer min-h-[44px]"
            style={{ border: '1px solid rgb(var(--navy) / 0.1)' }}
            onClick={() => set({ payMethodOpen: !state.payMethodOpen })}
            aria-expanded={state.payMethodOpen}
          >
            <PhIcon name="ph-fill ph-bank" size={20} color="rgb(var(--skydeep))" className="flex-shrink-0" />
            <div className="flex-1">
              <p className="m-0 text-[13px] font-bold text-navy">
                {state.payMethod === 'jcu' ? 'Juniper Credit Union ····4821' : state.payMethod === 'visa' ? 'Visa ····7923' : 'Apple Pay'}
              </p>
              <p className="m-0 text-[12px] font-semibold text-slate">
                {state.payMethod === 'jcu' ? 'No card fees — ACH is free' : state.payMethod === 'visa' ? '$2.85 processing fee' : 'No card fees'}
              </p>
            </div>
            <span className="text-[12.5px] font-bold" style={{ color: 'rgb(var(--skydeep))' }}>
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
                  className="w-full border-none font-sans text-left flex items-center gap-2.5 px-3.5 py-2.5 min-h-[44px] cursor-pointer bg-[rgb(var(--paper))]"
                  style={{ borderBottom: pm.key !== 'apple' ? '1px solid rgb(var(--navy) / 0.06)' : undefined }}
                  aria-pressed={state.payMethod === pm.key}
                >
                  <PhIcon name={pm.icon} size={17} color="rgb(var(--skydeep))" className="flex-shrink-0" />
                  <div className="flex-1">
                    <p className="m-0 text-[12.5px] font-bold text-navy">{pm.label}</p>
                    <p className="m-0 text-[12px] font-semibold text-slate">{pm.sub}</p>
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
              <p className="m-0 text-[12px] font-semibold text-slate">
                Never think about dues again
              </p>
            </div>
            <Toggle on={state.autopay} onToggle={toggleAutopay} label="Autopay — charge this account automatically on the 3rd of each month" />
          </div>
          <button
            onClick={doPay}
            className="w-full border-none rounded-2xl min-h-[52px] py-3 text-[14px] font-extrabold cursor-pointer text-white font-sans"
            style={{ background: 'rgb(var(--skydeep))' }}
          >
            {payBtnLabel}
          </button>
          {state.autopay && (
            <p className="m-0 mt-2 text-[12px] font-semibold text-center text-slate">
              Autopay charges this account on the 3rd of each month. Cancel any time in My Place.
            </p>
          )}
          {delinquent && (
            <button
              onClick={startPlan}
              className="w-full bg-transparent rounded-[14px] min-h-[48px] text-[13.5px] font-extrabold cursor-pointer text-navy mt-2.5 font-sans"
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
          <h2 className="m-0 mt-2.5 mb-[3px] font-serif font-normal text-[19px] text-navy">
            Payment plan is set.
          </h2>
          <p className="m-0 mb-3.5 text-[13px] font-bold text-slate">
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
            className="w-full border-none text-mist rounded-2xl min-h-[52px] text-[14.5px] font-extrabold cursor-pointer bg-skydeep font-sans"
          >
            Done
          </button>
        </div>
      )}
      {paid && (
        <div className="relative text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-check-circle" size={52} color="rgb(var(--sage))" />
          <h2 className="m-0 mt-2.5 mb-[3px] font-serif font-normal text-[19px] text-navy">
            Paid. Done in two taps.
          </h2>
          <p className="m-0 mb-4 text-[13px] font-bold text-slate">
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
            className="w-full border-none text-mist rounded-2xl min-h-[52px] text-[14.5px] font-extrabold cursor-pointer bg-skydeep font-sans"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
