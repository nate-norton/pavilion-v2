import { PhotoPlaceholder } from 'pavilion-v2';

// The default striped stand-in — a mono caption over the sand hatch, used
// wherever a resident photo hasn't been uploaded yet.
export const Default = () => (
  <div style={{ width: 300 }}>
    <PhotoPlaceholder label="amenity photo" />
  </div>
);

// Height + tint are adjustable — a taller cover slot with a sage wash.
export const Variants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
    <PhotoPlaceholder label="event cover" height={120} />
    <PhotoPlaceholder label="listing" height={72} tint="rgb(var(--sagesoft))" />
  </div>
);
