import { usePavStore } from '../store/store';
import { Commons } from '../screens/Commons';
import { Hoa } from '../screens/Hoa';
import { Reserve } from '../screens/Reserve';
import { Today } from '../screens/Today';
import { ErrorBoundary } from './ErrorBoundary';
import { NavDock } from './NavDock';
import { Overlays } from './Overlays';

const SCREEN_LABELS: Record<string, string> = {
  today: 'Today',
  commons: 'Commons',
  reserve: 'Reserve',
  hoa: 'HOA',
};

/** The 393x830 phone shell: status bar, active tab screen, overlays, nav dock. */
export function PhoneFrame() {
  const tab = usePavStore((s) => s.tab);
  const label = SCREEN_LABELS[tab] ?? 'Today';

  return (
    <div
      data-testid="phone-frame"
      className="relative w-[393px] h-[830px] max-h-[calc(100vh-48px)] rounded-[44px] overflow-hidden bg-cream shrink-0 max-[500px]:w-full max-[500px]:h-dvh max-[500px]:max-h-dvh max-[500px]:rounded-none"
      style={{ boxShadow: '0 40px 90px -30px rgba(50,42,26,0.5), 0 0 0 1px rgba(26,51,82,0.05)' }}
    >
      <ErrorBoundary>
        {tab === 'today' ? (
          <Today />
        ) : tab === 'commons' ? (
          <Commons />
        ) : tab === 'reserve' ? (
          <Reserve />
        ) : tab === 'hoa' ? (
          <Hoa />
        ) : (
          <div data-screen-label={label} className="pav-scroll absolute inset-0 overflow-y-auto animate-scpop" />
        )}
        <Overlays />
        <NavDock />
      </ErrorBoundary>
    </div>
  );
}
