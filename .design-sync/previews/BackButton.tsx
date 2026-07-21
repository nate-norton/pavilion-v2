import { BackButton } from 'pavilion-v2';

// The shared "← Back" affordance at the top of secondary screens. Arrow icon
// + stone label, no chrome.
export const Default = () => (
  <div style={{ width: 200 }}>
    <BackButton onClick={() => {}} />
  </div>
);

// Custom label — used when the destination is worth naming.
export const CustomLabel = () => (
  <div style={{ width: 200 }}>
    <BackButton onClick={() => {}} label="Directory" />
  </div>
);
