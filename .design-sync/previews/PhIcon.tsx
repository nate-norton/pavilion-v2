import { PhIcon } from 'pavilion-v2';

const wrap = { display: 'flex', gap: 18, flexWrap: 'wrap' as const, alignItems: 'center' };

// A sampler of the amenity/action glyphs used across Pavilion, at the app's
// default fill weight in navy.
export const Sampler = () => (
  <div style={wrap}>
    {['house-line', 'users-three', 'calendar-check', 'chat-circle', 'swimming-pool', 'gavel', 'receipt', 'bell'].map((n) => (
      <PhIcon key={n} name={`ph-fill ph-${n}`} size={26} color="rgb(var(--navy))" />
    ))}
  </div>
);

// The three weights the design system uses — fill, bold, and regular — on one
// glyph.
export const Weights = () => (
  <div style={wrap}>
    <PhIcon name="ph-fill ph-shield-check" size={28} color="rgb(var(--navy))" />
    <PhIcon name="ph-bold ph-shield-check" size={28} color="rgb(var(--navy))" />
    <PhIcon name="ph-shield-check" size={28} color="rgb(var(--navy))" />
  </div>
);

// Accent coloring — terracotta for emphasis, sage/gold/sky for status.
export const Colors = () => (
  <div style={wrap}>
    <PhIcon name="ph-fill ph-sparkle" size={26} color="rgb(var(--terracotta))" />
    <PhIcon name="ph-fill ph-heart" size={26} color="rgb(var(--sage))" />
    <PhIcon name="ph-fill ph-shield-check" size={26} color="rgb(var(--gold))" />
    <PhIcon name="ph-fill ph-map-trifold" size={26} color="rgb(var(--skydeep))" />
  </div>
);
