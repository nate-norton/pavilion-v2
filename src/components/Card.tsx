import type { CSSProperties, ReactNode } from 'react';

/*
 * Card — the one surface primitive.
 *
 * The audit counted 52 hand-rolled `rounded-[18px]` cards and 96 inline
 * `border: 1px solid rgb(var(--navy) / 0.08)` declarations across 28 files.
 * That is why the app reads flat: every surface sits at the same height as
 * the ground, separated by an 8% hairline, and any change to depth is a
 * 96-site edit. This component owns the surface so elevation can mean
 * something.
 *
 * Two elevations, deliberately:
 *   - `flat`   — paper with the hairline. Lists, logs, archives, anything
 *                the reader scans but does not act on.
 *   - `raised` — the ink shadow the system already used on StackedCard.
 *                Reserved for what needs a decision or a tap. Raising every
 *                card would put the page back where it started.
 *
 * Tints are the pale beds already in :root, each with its text colours
 * solved to AA in index.css. On a tinted bed, secondary text is the
 * tint's own dark twin, never grey.
 */
const TINTS = {
  paper: 'rgb(var(--paper))',
  mistpale: 'rgb(var(--mistpale))',
  skywash: 'rgb(var(--skywash))',
  skypale: 'rgb(var(--skypale))',
  mint: 'rgb(var(--mint))',
  goldpale: 'rgb(var(--goldpale))',
  sunsetpale: 'rgb(var(--sunsetpale))',
} as const;

export type CardTint = keyof typeof TINTS;
export type CardElevation = 'flat' | 'raised';

export const CARD_HAIRLINE = '1px solid rgb(var(--navy) / 0.08)';
/** Ink-based, offset, soft: the same recipe StackedCard carries. */
export const CARD_SHADOW = '0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 24px rgb(var(--shadow) / 0.10)';

export interface CardProps {
  elevation?: CardElevation;
  tint?: CardTint;
  /** Padding preset. `md` is the 16px most cards use; `lg` the 18px the HOA sections use; `none` for flush children. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Renders a <button> and makes the whole surface the target. */
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
  children: ReactNode;
}

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-[18px]',
};

export function Card({
  elevation = 'flat',
  tint = 'paper',
  padding = 'md',
  onClick,
  className,
  style,
  children,
  ...rest
}: CardProps) {
  const surface: CSSProperties = {
    background: TINTS[tint],
    ...(elevation === 'raised' ? { boxShadow: CARD_SHADOW } : { border: CARD_HAIRLINE }),
    ...style,
  };
  const classes = ['rounded-[18px] text-left', PADDING[padding], className ?? ''].join(' ').trim();

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${classes} block w-full border-0 font-sans cursor-pointer transition-transform active:scale-[0.985]`}
        style={surface}
        data-testid={rest['data-testid']}
      >
        {children}
      </button>
    );
  }
  return (
    <div className={classes} style={surface} data-testid={rest['data-testid']}>
      {children}
    </div>
  );
}
