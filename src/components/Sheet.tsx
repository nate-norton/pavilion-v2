import { useEffect, useRef, type ReactNode } from 'react';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  children?: ReactNode;
  maxHeight?: string;
  /** Accessible name for the dialog. Defaults to a generic one. */
  label?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet chrome shared across pay/ARC/report/violation/AI sheets.
 *
 * Carries real dialog semantics, which it did not before: `role="dialog"` +
 * `aria-modal` so assistive tech announces it as a layer rather than more
 * page, and a focus trap so Tab cannot walk out the back. Without the trap a
 * keyboard user could tab from an open payment sheet onto controls on the
 * screen behind the scrim — visible to them in the focus ring, invisible on
 * screen, and still live.
 */
export function Sheet({ open, onClose, children, maxHeight, label = 'Dialog' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    // Remember where focus came from so closing returns it there rather than
    // dumping the user at the top of the document.
    restoreTo.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (items.length === 0) { e.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      // Wrap at both ends, and pull focus back in if it has already escaped.
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault(); first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[80]">
      <div
        data-testid="sheet-scrim"
        onClick={onClose}
        className="absolute inset-0 animate-scrimfade"
        style={{ background: 'rgb(var(--scrim) / 0.4)' }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute left-0 right-0 bottom-0 bg-mistpale rounded-t-[28px] px-5 pt-3.5 pb-6 animate-sheetup overflow-y-auto"
        style={{
          boxShadow: '0 -18px 50px rgb(var(--scrim) / 0.25)',
          maxHeight: maxHeight ?? '90%',
        }}
      >
        <div
          className="w-10 h-1 rounded-full mx-auto mb-4"
          style={{ background: 'rgb(var(--navy) / 0.15)' }}
        />
        {children}
      </div>
    </div>
  );
}
