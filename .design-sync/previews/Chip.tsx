import { useState } from 'react';
import { Chip, PhIcon } from 'pavilion-v2';

// Interactive filter row — one active (navy) among inactive (paper) chips.
// The active state is the primary axis.
export const Filters = () => {
  const [active, setActive] = useState('all');
  const tabs = ['All', 'Events', 'Notices', 'For sale'];
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tabs.map((t) => (
        <Chip key={t} label={t} active={active === t.toLowerCase()} onClick={() => setActive(t.toLowerCase())} />
      ))}
    </div>
  );
};

// With a leading icon — the AI/highlight chip pattern.
export const WithIcon = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <Chip label="Ask AI" icon={<PhIcon name="ph-fill ph-sparkle" size={12} color="rgb(var(--terracotta))" />} />
    <Chip label="Board" active icon={<PhIcon name="ph-fill ph-shield-check" size={12} color="rgb(var(--cream))" />} />
  </div>
);

// The two paddings: sm (inline) and md (request sheets).
export const Sizes = () => (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
    <Chip label="Small" size="sm" />
    <Chip label="Medium" size="md" />
  </div>
);
