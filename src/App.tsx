export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center gap-11 flex-wrap p-6"
      style={{ background: 'radial-gradient(120% 90% at 50% 0%, #F2EBDC 0%, #EBE3D0 60%, #E5DCC6 100%)' }}>
      <div data-testid="phone-frame"
        className="relative w-[393px] h-[830px] max-h-[calc(100vh-48px)] rounded-[44px] overflow-hidden bg-cream shrink-0"
        style={{ boxShadow: '0 40px 90px -30px rgba(50,42,26,0.5), 0 0 0 1px rgba(26,51,82,0.05)' }} />
    </div>
  );
}
