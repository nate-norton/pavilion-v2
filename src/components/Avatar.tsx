export interface AvatarProps {
  initial: string;
  color: string;
  size?: number;
}

/*
 * An avatar's fill carries a letter, so it is a text-bearing surface and falls
 * under the design system's twin rule: decorative fills (--sage, --sky, --gold)
 * are too light for white type. Rather than fix ~50 call sites, the swap
 * happens here — callers keep naming the brand colour they mean.
 *
 * Light fills flip the letter to navy instead, since no darkening of a
 * near-white token would still read as that colour.
 */
const TEXT_BEARING: Record<string, string> = {
  'rgb(var(--sage))': 'rgb(var(--sagedark))',
  'rgb(var(--sky))': 'rgb(var(--skydark))',
  'rgb(var(--gold))': 'rgb(var(--golddark))',
  'rgb(var(--ember))': 'rgb(var(--emberdeep))',
  'rgb(var(--red))': 'rgb(var(--reddeep))',
  'rgb(var(--sagebright))': 'rgb(var(--sagedark))',
  'rgb(var(--emberbright))': 'rgb(var(--emberdeep))',
  'rgb(var(--stonelight))': 'rgb(var(--stone))',
};

/** Fills too light for white type at any darkness — the letter goes navy. */
const LIGHT_FILLS = new Set([
  'rgb(var(--cream))', 'rgb(var(--white))', 'rgb(var(--paper))', 'rgb(var(--sand))',
  'rgb(var(--claypale))', 'rgb(var(--peach))', 'rgb(var(--mint))', 'rgb(var(--blush))',
  'rgb(var(--goldpale))', 'rgb(var(--skypale))', 'rgb(var(--parchment))',
]);

/** Circular initial avatar, e.g. lines 295/315. */
export function Avatar({ initial, color, size = 32 }: AvatarProps) {
  const onLight = LIGHT_FILLS.has(color);
  const bg = TEXT_BEARING[color] ?? color;
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold ${onLight ? 'text-navy' : 'text-cream'}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.375 }}
    >
      {initial}
    </div>
  );
}
