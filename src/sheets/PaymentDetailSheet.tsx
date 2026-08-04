import { Sheet } from '../components/Sheet';
import { PhIcon } from '../components/PhIcon';
import { usePavStore } from '../store/store';
import { useRepository } from '../data/repo';

const DUES_LEGEND = [
  { label: 'Landscaping', amount: '$78', color: 'rgb(var(--sage))' },
  { label: 'Reserves', amount: '$71', color: 'rgb(var(--navy))' },
  { label: 'Insurance', amount: '$54', color: 'rgb(var(--ember))' },
  { label: 'Utilities', amount: '$48', color: 'rgb(var(--gold))' },
  { label: 'Management', amount: '$34', color: 'rgb(var(--stonelight))' },
];

interface PaymentRow {
  month: string;
  amount: '$285';
  getStatus: (state: { paid: boolean; showDelinquent: boolean }) => {
    label: string;
    bg: string;
    color: string;
    isPaid: boolean;
    confirmation?: string;
  };
}

const PAYMENTS: PaymentRow[] = [
  {
    month: 'July 2026',
    amount: '$285',
    getStatus: ({ paid }) => paid
      ? { label: 'Paid', bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', isPaid: true, confirmation: '#P-2187' }
      : { label: 'Due Jul 1', bg: 'rgb(var(--skypale))', color: 'rgb(var(--skydeep))', isPaid: false },
  },
  {
    month: 'June 2026',
    amount: '$285',
    getStatus: ({ paid, showDelinquent }) => {
      if (showDelinquent && !paid) return { label: 'Past due – 30 days', bg: 'rgb(var(--blush))', color: 'rgb(var(--terracotta))', isPaid: false };
      return { label: 'Paid Jun 2', bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', isPaid: true, confirmation: '#P-2145' };
    },
  },
  {
    month: 'May 2026',
    amount: '$285',
    getStatus: () => ({ label: 'Paid May 3', bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', isPaid: true, confirmation: '#P-2103' }),
  },
  {
    month: 'April 2026',
    amount: '$285',
    getStatus: () => ({ label: 'Paid Apr 3', bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))', isPaid: true, confirmation: '#P-2041' }),
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

  return (
    <Sheet open onClose={() => set({ paymentDetailIdx: null })}>
      <div className="flex items-center justify-between gap-2.5 mb-1">
        <p className="m-0 font-serif text-[19px] text-navy">{row.month}</p>
        <span
          className="rounded-full px-2.5 py-1 text-[11px] font-bold flex-shrink-0"
          style={{ background: status.bg, color: status.color }}
        >
          {status.label}
        </span>
      </div>
      <p className="m-0 text-[24px] font-bold text-navy mb-4">{row.amount}</p>

      <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3">
        <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'rgb(var(--stonelight))' }}>
          Breakdown
        </p>
        {DUES_LEGEND.map((d) => (
          <div key={d.label} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="text-[13px] font-bold text-navy">{d.label}</span>
            </div>
            <span className="text-[13px] font-bold text-navy">{d.amount}</span>
          </div>
        ))}
      </div>

      <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3">
        <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgb(var(--stonelight))' }}>
          Payment method
        </p>
        <div className="flex items-center gap-2.5">
          <PhIcon name="ph-fill ph-bank" size={16} color="rgb(var(--navy))" />
          <p className="m-0 text-[13.5px] font-bold text-navy">Juniper CU ····4821 · ACH</p>
        </div>
      </div>

      {status.confirmation && (
        <div className="bg-cream rounded-2xl px-4 py-3.5 mb-3">
          <p className="m-0 text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'rgb(var(--stonelight))' }}>
            Confirmation
          </p>
          <p className="m-0 text-[13.5px] font-bold text-navy">{status.confirmation}</p>
        </div>
      )}

      {!status.isPaid && (
        <button
          onClick={() => set({ paySheetOpen: true, paymentDetailIdx: null })}
          className="w-full rounded-2xl py-3.5 border-none text-[14px] font-extrabold cursor-pointer font-sans mt-1"
          style={{ background: 'rgb(var(--navy))', color: 'rgb(var(--cream))' }}
        >
          Pay now
        </button>
      )}
    </Sheet>
  );
}
