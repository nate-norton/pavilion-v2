interface ConfettiPiece {
  width: number;
  height: number;
  background: string;
  tx: string;
  ty: string;
  rot: string;
  radius?: string;
  delay: string;
  duration: string;
}

// Copied verbatim from prototype line 193.
const PIECES: ConfettiPiece[] = [
  { width: 7, height: 11, background: 'rgb(var(--ember))', tx: '-84px', ty: '-72px', rot: '220deg', delay: '0.05s', duration: '0.9s' },
  { width: 6, height: 6, background: 'rgb(var(--sage))', tx: '70px', ty: '-84px', rot: '160deg', radius: '50%', delay: '0.1s', duration: '0.95s' },
  { width: 7, height: 11, background: 'rgb(var(--gold))', tx: '120px', ty: '-40px', rot: '300deg', delay: '0s', duration: '0.85s' },
  { width: 6, height: 6, background: 'rgb(var(--sky))', tx: '-120px', ty: '-30px', rot: '120deg', radius: '50%', delay: '0.08s', duration: '1s' },
  { width: 7, height: 11, background: 'rgb(var(--skydeep))', tx: '40px', ty: '-96px', rot: '260deg', delay: '0.12s', duration: '0.9s' },
  { width: 6, height: 10, background: 'rgb(var(--emberbright))', tx: '-40px', ty: '-100px', rot: '180deg', delay: '0s', duration: '1s' },
];

/** The 6-span confetti burst used on the "all caught up" card (line 193). */
export function Confetti() {
  return (
    <>
      {PIECES.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: p.width,
            height: p.height,
            background: p.background,
            borderRadius: p.radius,
            // @ts-expect-error custom CSS vars
            '--tx': p.tx,
            '--ty': p.ty,
            '--rot': p.rot,
            animation: `confettiPop ${p.duration} ${p.delay} ease-out both`,
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  );
}
