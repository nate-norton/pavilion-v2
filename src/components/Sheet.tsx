import type { ReactNode } from 'react';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  maxHeight?: string;
}

/**
 * Bottom sheet chrome shared across pay/ARC/report/violation/AI sheets.
 * Prototype reference: pay-sheet lines 1282-1285.
 */
export function Sheet({ open, onClose, children, maxHeight }: SheetProps) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[80]">
      <div
        data-testid="sheet-scrim"
        onClick={onClose}
        className="absolute inset-0 animate-scrimfade"
        style={{ background: 'rgba(26,30,20,0.4)' }}
      />
      <div
        className="absolute left-0 right-0 bottom-0 bg-parchment rounded-t-[28px] px-5 pt-3.5 pb-6 animate-sheetup overflow-y-auto"
        style={{
          boxShadow: '0 -18px 50px rgba(26,30,20,0.25)',
          maxHeight: maxHeight ?? '90%',
        }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: 'rgba(26,51,82,0.15)' }}
        />
        {children}
      </div>
    </div>
  );
}
