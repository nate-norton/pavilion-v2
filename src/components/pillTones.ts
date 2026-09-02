/*
 * The shared status vocabulary behind <Pill tone>. Lives apart from the
 * component so the file stays fast-refresh clean; see Pill.tsx for why one
 * map exists.
 */
export const PILL_TONES = {
  /** Done, paid, approved, resolved. */
  success: { bg: 'rgb(var(--mint))', color: 'rgb(var(--sagedark))' },
  /** In progress, informational, "plan active". */
  info: { bg: 'rgb(var(--accenttint))', color: 'rgb(var(--accent))' },
  /** Needs the reader: due, info requested, pending their action. */
  warning: { bg: 'rgb(var(--goldpale))', color: 'rgb(var(--golddark))' },
  /** Declined, past due, escalated. */
  danger: { bg: 'rgb(var(--sunsetdim))', color: 'rgb(var(--sunsetdeep))' },
  /** Archived, closed, no signal. */
  neutral: { bg: 'rgb(var(--skywash))', color: 'rgb(var(--slatedark))' },
  /** On skydeep chrome: the peach control, navy text (4.52:1 on sky). */
  chrome: { bg: 'rgb(var(--peach))', color: 'rgb(var(--navy))' },
} as const;

export type PillTone = keyof typeof PILL_TONES;
