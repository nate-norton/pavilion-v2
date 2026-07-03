import { BriefPanel } from './components/BriefPanel';
import { PhoneFrame } from './components/PhoneFrame';

export default function App() {
  return (
    <div
      className="min-h-screen flex items-center justify-center gap-11 flex-wrap p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #F2EBDC 0%, #EBE3D0 60%, #E5DCC6 100%)' }}
    >
      <BriefPanel />
      <PhoneFrame />
    </div>
  );
}
