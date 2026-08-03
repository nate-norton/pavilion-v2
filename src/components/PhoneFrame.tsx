import { useRef } from 'react';
import { usePavStore } from '../store/store';
import { isLiveMode } from '../auth/AuthGate';
import { AppToast } from './AppToast';
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

  return (
    <div
      data-testid="phone-frame"
      data-desk-board={deskBoard ? '' : undefined}
      className="pav-frame relative w-[393px] h-[830px] max-h-[calc(100vh-48px)] rounded-[44px] overflow-hidden bg-cream shrink-0 max-[500px]:w-full max-[500px]:h-dvh max-[500px]:max-h-dvh max-[500px]:rounded-none"
      style={{ boxShadow: '0 40px 90px -30px rgb(var(--shadow) / 0.5), 0 0 0 1px rgb(var(--navy) / 0.05)' }}
    >
      <ErrorBoundary>
        <div key={tab} className={`absolute inset-0 ${slideClass}`}>
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
        </div>
        <Overlays />
        <NavDock />
        <AppToast />
      </ErrorBoundary>
    </div>
  );
}
