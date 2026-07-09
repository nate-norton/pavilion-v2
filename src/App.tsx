import { PhoneFrame } from './components/PhoneFrame';

export default function App() {
  return (
    <div
      className="min-h-dvh flex items-center justify-center p-6 max-[500px]:p-0"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #F2EBDC 0%, #EBE3D0 60%, #E5DCC6 100%)' }}
    >
      <PhoneFrame />
    </div>
  );
}
