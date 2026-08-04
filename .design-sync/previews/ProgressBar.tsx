import { ProgressBar } from 'pavilion-v2';

// Fill levels — the pct axis. Default navy fill on a faint navy track.
export const Levels = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
    <ProgressBar pct={35} />
    <ProgressBar pct={64} />
    <ProgressBar pct={82} />
  </div>
);

// Colored + gradient variants — sage for reserves-on-track, ember gradient
// for the fundraising hero bar.
export const Variants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 300 }}>
    <ProgressBar pct={64} color="rgb(var(--sage))" track="rgb(var(--sage) / 0.15)" />
    <ProgressBar pct={82} gradient />
  </div>
);
