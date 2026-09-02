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

/** Open/close travel time. Open decelerates with no overshoot — the sheet
 * arrives and stops; close is a touch quicker. */
const ENTER_MS = 300;
const EXIT_MS = 240;
const ENTER_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EXIT_EASE = 'cubic-bezier(0.4, 0, 1, 1)';
/** Spring-back after a short drag: a small overshoot so it feels like it caught. */
const SETTLE_EASE = 'cubic-bezier(0.32, 1.2, 0.5, 1)';
/** Drag past this many px, or flick faster than this, and the sheet goes. */
const DISMISS_PX = 110;
const DISMISS_VELOCITY = 0.55; // px per ms
/** Movement below this is a tap, not a drag. */
const DRAG_SLOP = 6;

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
 * Motion: one transition-driven transform carries open, close, drag and
 * spring-back, so nothing can cancel or restart mid-flight. Open decelerates
 * and stops — no overshoot — and close slides back down instead of
 * vanishing. The grab handle is real. Dragging from the handle (or
 * anywhere on a sheet whose content doesn't scroll) follows the finger; let
 * go past a threshold or with a flick and it dismisses from where it is,
 * otherwise it springs back. Drags from scrollable content stay scrolls, so
 * the gesture never fights a list. Under prefers-reduced-motion the exit is
 * instant, as the entry already is.
 */
export function Sheet({ open, onClose, children, maxHeight, label = 'Dialog' }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  // Position is one transition-driven transform: off-screen → 0 on open,
  // 0 → off-screen on close, and `dy` in between while a finger has it.
  // No keyframes, so nothing can cancel or restart mid-flight.
  const [phase, setPhase] = useState<'closed' | 'opening' | 'open' | 'closing'>(open ? 'opening' : 'closed');
  const [mounted, setMounted] = useState(open);
  const drag = useRef<{ id: number; startY: number; startT: number; active: boolean } | null>(null);
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true); setDy(0); setSettling(false);
      if (reducedMotion()) { setPhase('open'); return; }
      setPhase('opening');
      // Two frames so the off-screen position paints before the transition starts.
      let r2 = 0;
      const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setPhase('open')); });
      return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
    }
    if (!mounted) return;
    if (reducedMotion()) { setMounted(false); setPhase('closed'); return; }
    setPhase('closing');
    const t = setTimeout(() => { setMounted(false); setPhase('closed'); setDy(0); }, EXIT_MS);
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

  /** Whether a drag may begin here: always from the handle strip; from the
   * body only when the content isn't scrollable (so lists keep their scroll). */
  const canDragFrom = useCallback((target: EventTarget | null, fromHandle: boolean) => {
    const panel = panelRef.current;
    if (!panel) return false;
    if (fromHandle) return true;
    if (panel.scrollHeight > panel.clientHeight + 1) return false;
    return !(target instanceof HTMLElement && target.closest('input, textarea, select, button, a, [role="slider"]'));
  }, []);

  const onPointerDown = (fromHandle: boolean) => (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (drag.current || phase !== 'open') return;
    if (!canDragFrom(e.target, fromHandle)) return;
    drag.current = { id: e.pointerId, startY: e.clientY, startT: performance.now(), active: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const raw = e.clientY - d.startY;
    // A tap isn't a drag: nothing moves until the finger has clearly travelled.
    if (!d.active) {
      if (Math.abs(raw) < DRAG_SLOP) return;
      d.active = true; setDragging(true); setSettling(false);
    }
    // Upward gets rubber-band resistance: the sheet follows a little, so the
    // finger never feels ignored, and eases back on release.
    setDy(raw < 0 ? -Math.pow(-raw, 0.7) : raw);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.active) return;                       // it was a tap
    setDragging(false);
    const delta = Math.max(0, e.clientY - d.startY);
    const velocity = delta / Math.max(1, performance.now() - d.startT);
    if (delta > DISMISS_PX || (delta > 40 && velocity > DISMISS_VELOCITY)) {
      onClose();                                 // parent flips `open`; exit continues from here
    } else {
      setSettling(true);                         // spring back to 0
      setDy(0);
    }
  };

  if (!mounted) return null;

  const offscreen = phase === 'opening' || phase === 'closing';
  const transform = offscreen ? 'translateY(100%)' : `translateY(${dy}px)`;
  const transition = dragging
    ? 'none'
    : phase === 'closing'
      ? `transform ${EXIT_MS}ms ${EXIT_EASE}`
      : settling
        ? `transform 280ms ${SETTLE_EASE}`
        : `transform ${ENTER_MS}ms ${ENTER_EASE}`;
  const scrimOpacity = offscreen ? 0 : Math.min(1, Math.max(0, 1 - dy / 400));

  return (
    <div className="absolute inset-0 z-[80]">
      <div
        data-testid="sheet-scrim"
        onClick={onClose}
        className="absolute inset-0"
        style={{
          background: 'rgb(var(--scrim) / 0.4)',
          opacity: scrimOpacity,
          transition: dragging ? 'none' : `opacity ${phase === 'closing' ? EXIT_MS : ENTER_MS}ms ease`,
        }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute left-0 right-0 bottom-0 bg-mistpale rounded-t-[28px] px-5 pt-3.5 pb-6 overflow-y-auto"
        style={{
          boxShadow: '0 -18px 50px rgb(var(--scrim) / 0.25)',
          maxHeight: maxHeight ?? '90%',
          transform,
          transition,
          willChange: 'transform',
        }}
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
