import { Pill } from 'pavilion-v2';

// Read-only status badge. The variant axis is the bg/color pair — each maps to
// a semantic meaning (paid/overdue/role/highlight) drawn from the token ramp.
export const Tones = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
    <Pill label="Paid" bg="rgb(var(--mint))" color="rgb(var(--sagedark))" />
    <Pill label="Overdue" bg="rgb(var(--blushdim))" color="rgb(var(--reddeep))" />
    <Pill label="Due Jul 3" bg="rgb(var(--goldpale))" color="rgb(var(--golddark))" />
    <Pill label="Board" bg="rgb(var(--skypale))" color="rgb(var(--skydeep))" />
    <Pill label="Shoutout" bg="rgb(var(--blush))" color="rgb(var(--terracotta))" />
  </div>
);

// In context: a dues row pairing a name with its payment status pill.
export const InContext = () => (
  <div
    style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 12, width: 300, padding: '12px 14px', borderRadius: 16,
      background: 'rgb(var(--paper))', boxShadow: 'inset 0 0 0 1px rgb(var(--navy) / 0.08)',
      fontFamily: "'Nunito Sans', sans-serif",
    }}
  >
    <span style={{ fontSize: 14, fontWeight: 700, color: 'rgb(var(--navy))' }}>Unit 12B · A. Okafor</span>
    <Pill label="Paid" bg="rgb(var(--mint))" color="rgb(var(--sagedark))" />
  </div>
);
