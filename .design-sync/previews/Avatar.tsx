import { Avatar } from 'pavilion-v2';

// The size axis — 26 / 36 / 48 / 64 — the four sizes used across the app,
// from inline list rows up to profile headers.
export const Sizes = () => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
    <Avatar initial="A" color="rgb(var(--navy))" size={26} />
    <Avatar initial="M" color="rgb(var(--accent))" size={36} />
    <Avatar initial="R" color="rgb(var(--sage))" size={48} />
    <Avatar initial="D" color="rgb(var(--sky))" size={64} />
  </div>
);

// A cluster of residents — the token accent ramp reads as distinct people.
export const People = () => (
  <div style={{ display: 'flex', gap: 8 }}>
    <Avatar initial="J" color="rgb(var(--navy))" size={40} />
    <Avatar initial="P" color="rgb(var(--sagedark))" size={40} />
    <Avatar initial="K" color="rgb(var(--gold))" size={40} />
    <Avatar initial="T" color="rgb(var(--skydeep))" size={40} />
  </div>
);
