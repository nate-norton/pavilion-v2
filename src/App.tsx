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
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #F2EBDC 0%, #EBE3D0 60%, #E5DCC6 100%)' }}
    >
      <PhoneFrame />
      {showPanel && <DemoPanel />}
    </div>
  );
}
