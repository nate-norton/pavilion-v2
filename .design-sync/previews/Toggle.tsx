import { useState } from 'react';
import { Toggle } from 'pavilion-v2';

// A labeled settings row — the toggle's real home. `initial` seeds the on/off
// state so both states are visible across the card.
function SettingRow({ label, size, initial }: { label: string; size?: 'sm' | 'lg'; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Toggle on={on} onToggle={() => setOn((v) => !v)} size={size} />
      <span style={{ fontFamily: "'Nunito Sans', sans-serif", fontSize: 13, fontWeight: 700, color: 'rgb(var(--bark))' }}>
        {label}
      </span>
    </div>
  );
}

// Small (default, 46×27) — the compact switch used inline in list rows.
export const Small = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <SettingRow label="Email notifications" size="sm" initial />
    <SettingRow label="SMS reminders" size="sm" initial={false} />
  </div>
);

// Large (52×30) — the emphasized switch used for primary settings.
export const Large = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <SettingRow label="Auto-pay dues" size="lg" initial />
    <SettingRow label="Quiet hours" size="lg" initial={false} />
  </div>
);
