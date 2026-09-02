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
  'rgb(var(--sunset))': 'rgb(var(--sunsetdeep))',
  'rgb(var(--red))': 'rgb(var(--reddeep))',
  'rgb(var(--sagebright))': 'rgb(var(--sagedark))',
  'rgb(var(--sunsetbright))': 'rgb(var(--sunsetdeep))',
  'rgb(var(--slatelight))': 'rgb(var(--slate))',
};

/** Fills too light for white type at any darkness — the letter goes navy. */
const LIGHT_FILLS = new Set([
  'rgb(var(--mist))', 'rgb(var(--white))', 'rgb(var(--paper))', 'rgb(var(--skyborder))',
  'rgb(var(--slatefaint))', 'rgb(var(--peach))', 'rgb(var(--mint))', 'rgb(var(--accenttint))',
  'rgb(var(--goldpale))', 'rgb(var(--skypale))', 'rgb(var(--mistpale))',
]);

/** Circular initial avatar, e.g. lines 295/315. */
export function Avatar({ initial, color, size = 32 }: AvatarProps) {
  const onLight = LIGHT_FILLS.has(color);
  const bg = TEXT_BEARING[color] ?? color;
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-bold ${onLight ? 'text-navy' : 'text-mist'}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.375 }}
    >
      {initial}
    </div>
  );
}
