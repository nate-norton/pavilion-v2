import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

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

/** Exit animation length; matches `sheetdown` in tailwind.config.ts. */
const EXIT_MS = 240;
/** Drag past this many px, or flick faster than this, and the sheet goes. */
const DISMISS_PX = 110;
const DISMISS_VELOCITY = 0.55; // px per ms

const reducedMotion = () =>
  typeof window === 'undefined' || typeof window.matchMedia !== 'function'
    ? true
    : window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Bottom sheet chrome shared across pay/ARC/report/violation/AI sheets.
 *
 * Carries real dialog semantics: `role="dialog"` + `aria-modal` so assistive
 * tech announces it as a layer rather than more page, and a focus trap so Tab
 * cannot walk out the back.
 *
 * Motion: it slides up on open and — new — slides back down on close instead
 * of vanishing, and the grab handle is real. Dragging from the handle (or
 * anywhere on a sheet whose content doesn't scroll) follows the finger; let
 * go past a threshold or with a flick and it dismisses from where it is,
 * otherwise it springs back. Drags from scrollable content stay scrolls, so
 * the gesture never fights a list. Under prefers-reduced-motion the exit is
 * instant, as the entry already is.
 */
export function Sheet({ open, onClose, children, maxHeight, label = 'Dialog' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  // Stay mounted through the exit animation.
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(open);
  // Drag state lives in refs (per-frame) with one piece of state for styling.
  const drag = useRef<{ id: number; startY: number; startT: number; lastY: number; lastT: number } | null>(null);
  const [dy, setDy] = useState(0);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    if (open) { setMounted(true); setClosing(false); setDy(0); return; }
    if (!mounted) return;
    if (reducedMotion()) { setMounted(false); return; }
    setClosing(true);
    const t = setTimeout(() => { setMounted(false); setClosing(false); setDy(0); }, EXIT_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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

  /** Whether a drag may begin here: always from the handle; from the body
   * only when the content isn't scrollable (so lists keep their scroll). */
  const canDragFrom = useCallback((target: EventTarget | null, fromHandle: boolean) => {
    const panel = panelRef.current;
    if (!panel) return false;
    if (fromHandle) return true;
    if (panel.scrollHeight > panel.clientHeight + 1) return false;
    // Don't hijack a drag that started on a control.
    return !(target instanceof HTMLElement && target.closest('input, textarea, select, button, a, [role="slider"]'));
  }, []);

  const onPointerDown = (fromHandle: boolean) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (!canDragFrom(e.target, fromHandle)) return;
    drag.current = { id: e.pointerId, startY: e.clientY, startT: performance.now(), lastY: e.clientY, lastT: performance.now() };
    setSettling(false);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const delta = Math.max(0, e.clientY - d.startY);
    d.lastY = e.clientY; d.lastT = performance.now();
    setDy(delta);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const delta = Math.max(0, e.clientY - d.startY);
    const dt = Math.max(1, performance.now() - d.startT);
    const velocity = delta / dt;
    if (delta > DISMISS_PX || (delta > 40 && velocity > DISMISS_VELOCITY)) {
      onClose();                 // parent flips `open`; the exit continues from `dy`
    } else {
      setSettling(true);         // spring back
      setDy(0);
    }
  };

  if (!mounted) return null;

  const dragging = drag.current !== null;
  const panelStyle: React.CSSProperties = {
    boxShadow: '0 -18px 50px rgb(var(--scrim) / 0.25)',
    maxHeight: maxHeight ?? '90%',
    // While dragging, follow the finger with no easing; on release, spring
    // back; on dismiss, hand the current offset to the exit keyframe.
    transform: closing ? undefined : `translateY(${dy}px)`,
    transition: dragging ? 'none' : settling ? 'transform 0.28s cubic-bezier(0.32,1.2,0.5,1)' : undefined,
    ['--sheet-from' as string]: `${dy}px`,
    /*
     * The last row of a sheet used to land in the home-indicator strip on a
     * notched phone: pb-6 was a flat 24px with no safe-area term. And
     * `--pav-keyboard` lifts the panel above the software keyboard (0 when
     * there isn't one), so a sheet with a field in it stays usable instead of
     * being typed at from underneath.
     */
    paddingBottom: 'calc(24px + var(--pav-safe-bottom))',
    bottom: 'var(--pav-keyboard)',
  };
  const scrimOpacity = closing ? undefined : Math.max(0, 1 - dy / 400);

  return (
    <div className="pav-fixed pav-sheet-root absolute inset-0 z-[80]">
      <div
        data-testid="sheet-scrim"
        onClick={onClose}
        className={`pav-scrim absolute inset-0 ${closing ? 'animate-scrimfadeout' : 'animate-scrimfade'}`}
        style={{ background: 'rgb(var(--scrim) / 0.4)', opacity: scrimOpacity, transition: dragging ? 'none' : 'opacity 0.2s ease' }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`pav-sheet absolute left-0 right-0 bottom-0 bg-mistpale rounded-t-[28px] px-5 pt-3.5 overflow-y-auto ${closing ? 'animate-sheetdown' : dy === 0 && !settling ? 'animate-sheetup' : ''}`}
        style={panelStyle}
        onPointerDown={onPointerDown(false)}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onTransitionEnd={() => setSettling(false)}
      >
        {/* The grab strip: the whole top edge is a drag target, tall enough
            to hit, with touch-action none so the browser hands us the gesture
            instead of scrolling. */}
        <div
          data-testid="sheet-handle"
          className="-mx-5 -mt-3.5 px-5 pt-3.5 pb-2.5 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={onPointerDown(true)}
          aria-hidden="true"
        >
          <div className="w-10 h-1 rounded-full mx-auto" style={{ background: 'rgb(var(--navy) / 0.15)' }} />
        </div>
        {children}
      </div>
    </div>
  );
}
