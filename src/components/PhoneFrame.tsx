import { useRef } from 'react';
import { usePavStore } from '../store/store';
import { useScrollTopOnChange } from '../lib/pageMode';
import { isLiveMode } from '../auth/AuthGate';
import { AppToast } from './AppToast';
import { ConfirmSheet } from './ConfirmSheet';
import { Commons } from '../screens/Commons';
import { Hoa } from '../screens/Hoa';
import { Reserve } from '../screens/Reserve';
import { Today } from '../screens/Today';
import { ErrorBoundary } from './ErrorBoundary';
import { NavDock } from './NavDock';
import { Overlays } from './Overlays';

const TAB_ORDER: Record<string, number> = { today: 0, commons: 1, reserve: 2, hoa: 3 };

/** The 393x830 phone shell: status bar, active tab screen, overlays, nav dock. */
export function PhoneFrame() {
  const tab = usePavStore((s) => s.tab);
  const boardMode = usePavStore((s) => s.boardMode);
  const prevTab = useRef(tab);
  const goingRight = (TAB_ORDER[tab] ?? 0) >= (TAB_ORDER[prevTab.current] ?? 0);
  prevTab.current = tab;

  const slideClass = goingRight ? 'animate-slideleft' : 'animate-slideright';

  // Page mode scrolls the document, so a tab change has to put it back at the
  // top itself (see useScrollTopOnChange).
  useScrollTopOnChange(tab);

  /*
   * Desktop board mode. Residents stay phone-shaped everywhere — that is the
   * real use scene (ninety seconds, one hand, standing in a driveway) and
   * stretching those screens would only ruin the line measure. Board work is
   * the opposite: a treasurer reconciling a month is at a desk, and a 393px
   * column is the wrong tool for it.
   *
   * So the shell widens only when the board surface is open, and only on a
   * viewport big enough to be a real desk (`pav-desk`, ≥1024px). The demo is
   * excluded outright: the presenter demo must stay byte-for-byte identical,
   * and `isLiveMode` is a build-time constant so this whole branch compiles
   * out of the demo bundle.
   *
   * This is a shell adaptation, not a desktop console. Board Desk's own
   * internals are still phone-composed; giving them a real multi-column
   * layout is a design project, not a media query.
   */
  const deskBoard = isLiveMode && boardMode;
  // Large type scales the screen layer only — the frame and dock keep their
  // geometry, so the app stays anchored while its content grows.
  const largeType = usePavStore((s) => s.largeType);

  return (
    <div
      data-testid="phone-frame"
      data-desk-board={deskBoard ? '' : undefined}
      data-large-type={largeType ? '' : undefined}
      className="pav-frame relative w-[393px] h-[830px] max-h-[calc(100svh-48px)] rounded-[44px] overflow-hidden bg-mist shrink-0"
    >
      <ErrorBoundary>
        <div key={tab} className={`pav-tabslide absolute inset-0 ${slideClass}`}>
          <main className="pav-screen pav-zoom w-full h-full relative">
          {tab === 'today' ? (
            <Today />
          ) : tab === 'commons' ? (
            <Commons />
          ) : tab === 'reserve' ? (
            <Reserve />
          ) : tab === 'hoa' ? (
            <Hoa />
          ) : (
            <div className="pav-scroll absolute inset-0 overflow-y-auto" />
          )}
          </main>
        </div>
        <Overlays />
        <NavDock />
        <AppToast />
        <ConfirmSheet />
      </ErrorBoundary>
    </div>
  );
}
