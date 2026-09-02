/*
 * Pill — the status badge, with one vocabulary for status.
 *
 * Every screen had its own map from status to colour, and they disagreed:
 * "due" was sky on the My Place tile and gold in its payment list;
 * "declined" and "in review" shared a colour on HOA. `tone` is the shared
 * map. Every pair below is a bed and its text-bearing twin from :root,
 * already solved to AA there.
 *
 * `bg`/`color` remain for the handful of call sites that colour a pill by
 * something other than status (a group's own colour, a chrome surface).
 */
import { PILL_TONES, type PillTone } from './pillTones';

export type { PillTone };

export interface PillProps {
  label: string;
  tone?: PillTone;
  /** Escape hatch; prefer `tone`. */
  bg?: string;
  color?: string;
  /** 'sm' is the 11px badge in dense rows; 'md' is 12px for cards. */
  size?: 'sm' | 'md';
}

export function Pill({ label, tone, bg, color, size = 'sm' }: PillProps) {
  const t = tone ? PILL_TONES[tone] : { bg: bg ?? PILL_TONES.neutral.bg, color: color ?? PILL_TONES.neutral.color };
  const cls = size === 'md' ? 'px-3 py-1 text-[12px]' : 'px-2.5 py-[3px] text-[11px]';
  return (
    <span
      className={`inline-block rounded-full ${cls} font-bold whitespace-nowrap leading-[1.5]`}
      style={{ background: t.bg, color: t.color }}
    >
      {label}
    </span>
  );
}
