import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { Card } from '../components/Card';
import { useRepository } from '../data/repo';
import { usePavStore } from '../store/store';

/**
 * Ledger export sheet — ported from prototype lines 2480-2512.
 *
 * The QuickBooks account, the line-item count and the reconciliation date
 * are the presenter script; nothing here reads a ledger. A live community
 * has no ledger to export yet, so it gets an honest note rather than a
 * receipt for a file that never existed.
 */
export function ExportSheet() {
  const state = usePavStore();
  const { set } = state;
  const repo = useRepository();

  const closeExport = () => set({ exportOpen: false });
  const exportQB = () => set({ exportDone: 'QuickBooks' });
  const exportCSV = () => set({ exportDone: 'CSV' });

  const exportPending = !state.exportDone;
  const exportDoneLabel = state.exportDone === 'QuickBooks' ? 'Synced to QuickBooks Online' : 'ledger.csv downloaded';

  if (!repo.isDemo()) {
    return (
      <Sheet label="Export the ledger" open={state.exportOpen} onClose={closeExport}>
        <h2 className="m-0 mb-1.5 font-serif font-normal text-[19px] text-navy leading-[1.25]">Exports aren't available yet</h2>
        <p className="m-0 mb-4 text-[13.5px] font-semibold text-slate leading-[1.5]">
          Pavilion doesn't keep a ledger for this community yet, so there is nothing to download.
        </p>
        <button
          type="button"
          onClick={closeExport}
          className="w-full border-none text-white rounded-2xl min-h-[44px] py-3 text-sm font-extrabold cursor-pointer font-sans bg-skydeep"
        >
          Close
        </button>
      </Sheet>
    );
  }

  return (
    <Sheet
      label="Export the ledger"
      open={state.exportOpen} onClose={closeExport}>
      {exportPending && (
        <div>
          <h2 className="m-0 mb-0.5 font-serif font-normal text-[19px] text-navy leading-[1.25]">Export the ledger</h2>
          <p className="m-0 mb-4 text-[12.5px] font-bold text-slate">
            July 2026 · dues, special assessments &amp; vendor payments
          </p>
          <Card elevation="raised" onClick={exportQB} padding="none" className="mb-[9px]">
            <div className="flex items-center gap-3 p-[14px_16px]">
              <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--mint))' }}>
                <PhIcon name="ph-fill ph-arrows-clockwise" size={18} color="rgb(var(--sage))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-sm font-bold text-navy">Sync to QuickBooks</p>
                <p className="m-0 text-[12px] font-semibold text-slate">
                  Online · connected as treasurer@juniperridge.org
                </p>
              </div>
              <PhIcon name="ph ph-caret-right" size={15} color="rgb(var(--slatelight))" />
            </div>
          </Card>
          <Card elevation="raised" onClick={exportCSV} padding="none">
            <div className="flex items-center gap-3 p-[14px_16px]">
              <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center flex-shrink-0 bg-skyborder">
                <PhIcon name="ph-fill ph-file-csv" size={18} color="rgb(var(--slatedark))" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="m-0 mb-px text-sm font-bold text-navy">Download CSV</p>
                <p className="m-0 text-[12px] font-semibold text-slate">
                  For Excel, Xero, or your accountant
                </p>
              </div>
              <PhIcon name="ph ph-caret-right" size={15} color="rgb(var(--slatelight))" />
            </div>
          </Card>
        </div>
      )}
      {!exportPending && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-check-circle" size={48} color="rgb(var(--sage))" />
          <h2 className="m-0 mt-2.5 mb-[3px] font-serif font-normal text-[19px] text-navy leading-[1.25]">{exportDoneLabel}</h2>
          <p className="m-0 mb-4 text-[12.5px] font-bold text-slate">
            129 line items · reconciled through Jun 30
          </p>
          <button
            type="button"
            onClick={closeExport}
            className="w-full border-none text-white rounded-2xl min-h-[44px] py-3 text-sm font-extrabold cursor-pointer font-sans bg-skydeep"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
