import { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { DemoPanel } from './components/DemoPanel';

export default function App() {
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowPanel((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6 max-[500px]:p-0 gap-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, rgb(var(--creamtint)) 0%, rgb(var(--sandtint)) 60%, rgb(var(--sanddeep)) 100%)' }}
    >
      <PhoneFrame />
      {showPanel && <DemoPanel />}
      {!showPanel && (
        <button
          type="button"
          onClick={() => setShowPanel(true)}
          aria-label="Open demo controls"
          className="fixed bottom-4 right-4 w-10 h-10 rounded-full border-none cursor-pointer flex items-center justify-center max-[500px]:hidden"
          style={{ background: 'rgb(var(--navy) / 0.08)', color: 'rgb(var(--stonelight))', fontSize: 18, transition: 'opacity 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.5'; }}
          ref={(el) => { if (el) el.style.opacity = '0.5'; }}
        >
          ⚙
        </button>
      )}
    </div>
  );
}
