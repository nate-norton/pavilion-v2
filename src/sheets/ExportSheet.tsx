import { PhIcon } from '../components/PhIcon';
import { Sheet } from '../components/Sheet';
import { usePavStore } from '../store/store';

/** Ledger export sheet — ported from prototype lines 2480-2512. */
export function ExportSheet() {
  const state = usePavStore();
  const { set } = state;

  const closeExport = () => set({ exportOpen: false });
  const exportQB = () => set({ exportDone: 'QuickBooks' });
  const exportCSV = () => set({ exportDone: 'CSV' });

  const exportPending = !state.exportDone;
  const exportDoneLabel = state.exportDone === 'QuickBooks' ? 'Synced to QuickBooks Online' : 'ledger.csv downloaded';

  return (
    <Sheet
      label="Export your data"
      open={state.exportOpen} onClose={closeExport}>
      {exportPending && (
        <div>
          <p className="m-0 mb-0.5 font-serif text-[19px] text-navy">Export the ledger</p>
          <p className="m-0 mb-4 text-[12.5px] font-bold" style={{ color: 'rgb(var(--slate))' }}>
            July 2026 · dues, special assessments &amp; vendor payments
          </p>
          <button
            onClick={exportQB}
            className="w-full rounded-[14px] p-[14px_16px] flex items-center gap-3 cursor-pointer text-left mb-[9px] bg-[rgb(var(--paper))]"
            style={{ border: '1px solid rgb(var(--navy) / 0.12)' }}
          >
            <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: 'rgb(var(--mint))' }}>
              <PhIcon name="ph-fill ph-arrows-clockwise" size={18} color="rgb(var(--sage))" />
            </div>
            <div className="flex-1">
              <p className="m-0 mb-px text-sm font-bold text-navy">Sync to QuickBooks</p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
                Online · connected as treasurer@juniperridge.org
              </p>
            </div>
            <PhIcon name="ph ph-caret-right" size={15} color="rgb(var(--slatelight))" />
          </button>
          <button
            onClick={exportCSV}
            className="w-full rounded-[14px] p-[14px_16px] flex items-center gap-3 cursor-pointer text-left bg-[rgb(var(--paper))]"
            style={{ border: '1px solid rgb(var(--navy) / 0.12)' }}
          >
            <div className="w-[38px] h-[38px] rounded-[11px] flex items-center justify-center flex-shrink-0 bg-skyborder">
              <PhIcon name="ph-fill ph-file-csv" size={18} color="rgb(var(--slatedark))" />
            </div>
            <div className="flex-1">
              <p className="m-0 mb-px text-sm font-bold text-navy">Download CSV</p>
              <p className="m-0 text-[11.5px] font-semibold" style={{ color: 'rgb(var(--slate))' }}>
                For Excel, Xero, or your accountant
              </p>
            </div>
            <PhIcon name="ph ph-caret-right" size={15} color="rgb(var(--slatelight))" />
          </button>
        </div>
      )}
      {!exportPending && (
        <div className="text-center pt-2 pb-1 animate-fadeup">
          <PhIcon name="ph-fill ph-check-circle" size={48} color="rgb(var(--sage))" />
          <p className="m-0 mt-2.5 mb-[3px] font-serif text-[19px] text-navy">{exportDoneLabel}</p>
          <p className="m-0 mb-4 text-[12.5px] font-bold" style={{ color: 'rgb(var(--slate))' }}>
            129 line items · reconciled through Jun 30
          </p>
          <button
            onClick={closeExport}
            className="w-full border-none text-mist rounded-2xl py-[14px] text-sm font-extrabold cursor-pointer bg-skydeep"
          >
            Done
          </button>
        </div>
      )}
    </Sheet>
  );
}
