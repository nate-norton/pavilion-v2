import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { SectionHeading } from '../components/SectionHeading';
import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useRepository } from '../data/repo';
import type { DuesStatus } from '../data/repo';
import { DUES_CATEGORIES, DUES_TONE } from '../lib/dues';

interface PaymentRow {
  month: string;
  amount: '$285';
  getStatus: (state: { paid: boolean; showDelinquent: boolean }) => {
    label: string;
    status: DuesStatus;
    confirmation?: string;
  };
}

// Scripted history: statuses map through the shared DUES_TONE so a paid row
// here is the same green as a paid row on My Place.
const PAYMENTS: PaymentRow[] = [
  {
    month: 'July 2026',
    amount: '$285',
    getStatus: ({ paid }) => paid
      ? { label: 'Paid', status: 'paid', confirmation: '#P-2187' }
      : { label: 'Due Jul 1', status: 'due' },
  },
  {
    month: 'June 2026',
    amount: '$285',
    getStatus: ({ paid, showDelinquent }) => {
      if (showDelinquent && !paid) return { label: 'Past due – 30 days', status: 'past_due' };
      return { label: 'Paid Jun 2', status: 'paid', confirmation: '#P-2145' };
    },
  },
  {
    month: 'May 2026',
    amount: '$285',
    getStatus: () => ({ label: 'Paid May 3', status: 'paid', confirmation: '#P-2103' }),
  },
  {
    month: 'April 2026',
    amount: '$285',
    getStatus: () => ({ label: 'Paid Apr 3', status: 'paid', confirmation: '#P-2041' }),
  },
];

export function PaymentDetailSheet() {
  const paymentDetailIdx = usePavStore((s) => s.paymentDetailIdx);
  const paid = usePavStore((s) => s.paid);
  const showDelinquent = usePavStore((s) => s.showDelinquent);
  const set = usePavStore((s) => s.set);
  // Scripted payment history — must never render in live.
  if (!useRepository().isDemo()) return null;

  if (paymentDetailIdx == null) return null;

  const row = PAYMENTS[paymentDetailIdx];
  if (!row) return null;

  const status = row.getStatus({ paid, showDelinquent });
  const isPaid = status.status === 'paid';

  return (
    <Sheet open label={`${row.month} statement`} onClose={() => set({ paymentDetailIdx: null })}>
      <div className="flex items-center justify-between gap-2.5 mb-1">
        <h2 className="m-0 font-serif font-normal text-[19px] text-navy">{row.month}</h2>
        <Pill label={status.label} tone={DUES_TONE[status.status]} size="md" />
      </div>
      <p className="m-0 font-serif text-[24px] text-navy mb-4" style={{ letterSpacing: '-0.02em' }}>{row.amount}</p>

      <Card className="mb-3">
        <SectionHeading title="Where it goes" meta="Every dollar of this statement" />
        <div className="flex h-2.5 rounded-full overflow-hidden mb-3" aria-hidden="true">
          {DUES_CATEGORIES.map((d) => (
            <div key={d.label} style={{ width: `${d.pct}%`, background: d.color }} />
          ))}
        </div>
        {DUES_CATEGORIES.map((d) => (
          <div key={d.label} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} aria-hidden="true" />
              <span className="text-[13px] font-bold text-navy">{d.label}</span>
            </div>
            <span className="text-[13px] font-bold text-navy tabular-nums">{d.amount}</span>
          </div>
        ))}
      </Card>

      <Card className="mb-3">
        <div className="flex items-center gap-2.5 min-h-[36px]">
          <span className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--skypale))' }} aria-hidden="true">
            <PhIcon name="ph-fill ph-bank" size={16} color="rgb(var(--skydeep))" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="m-0 text-[12.5px] font-semibold text-slate">Paid from</p>
            <p className="m-0 text-[13.5px] font-bold text-navy">Juniper CU ····4821 · ACH</p>
          </div>
        </div>
        {status.confirmation && (
          <div className="flex items-center gap-2.5 min-h-[36px] mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgb(var(--navy) / 0.06)' }}>
            <span className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--mint))' }} aria-hidden="true">
              <PhIcon name="ph-fill ph-receipt" size={16} color="rgb(var(--sagedark))" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="m-0 text-[12.5px] font-semibold text-slate">Confirmation</p>
              <p className="m-0 text-[13.5px] font-bold text-navy">{status.confirmation}</p>
            </div>
          </div>
        )}
      </Card>

      {!isPaid && (
        <button
          onClick={() => set({ paySheetOpen: true, paymentDetailIdx: null })}
          className="w-full rounded-2xl min-h-[52px] border-none text-[14px] font-extrabold cursor-pointer font-sans mt-1 text-white"
          style={{ background: 'rgb(var(--skydeep))' }}
        >
          Pay now
        </button>
      )}
    </Sheet>
  );
}
