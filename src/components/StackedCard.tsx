import type { ReactNode } from 'react';
import { PhIcon } from './PhIcon';

/*
 * StackedCard — the layered, big-radius editorial card pattern (the LDS
 * "Gospel Living" look), rebuilt in Pavilion's warm earth tones. Cards sit in
 * a <StackedCards> stack and overlap the one below via a shared negative
 * offset, so a tinted panel's rounded bottom curves over the next card. Each
 * card can carry an eyebrow, a serif title with an optional chevron
 * affordance, body copy, and a full-bleed image anchored to its bottom edge
 * with an optional caption overlay.
 *
 * Additive design-system primitive — nothing here touches the app or the
 * presenter demo. Preview it at /design-system.
 */

/** Named warm washes → surface + eyebrow text color. `paper` is the neutral. */
const TINTS: Record<string, { surface: string; eyebrow: string }> = {
  sage: { surface: 'rgb(var(--sagetint))', eyebrow: 'rgb(var(--sagedark))' },
  sand: { surface: 'rgb(var(--sandtint))', eyebrow: 'rgb(var(--bark))' },
  blush: { surface: 'rgb(var(--blushpale))', eyebrow: 'rgb(var(--terracotta))' },
  gold: { surface: 'rgb(var(--goldpale))', eyebrow: 'rgb(var(--golddark))' },
  sky: { surface: 'rgb(var(--skypale))', eyebrow: 'rgb(var(--skydeep))' },
  paper: { surface: 'rgb(var(--paper))', eyebrow: 'rgb(var(--stone))' },
};

export type StackedTint = keyof typeof TINTS;

export interface StackedCardProps {
  /** Small caption above the title, e.g. "Fast Sunday". Colored to the tint. */
  eyebrow?: string;
  /** Serif display title — the anchor of the card. */
  title: ReactNode;
  /** Optional body copy under the title. */
  body?: ReactNode;
  /** Warm wash behind the card. Defaults to `sand`. */
  tint?: StackedTint;
  /** Renders a right-aligned chevron; pairs with `onClick` for tap affordance. */
  chevron?: boolean;
  /** Makes the whole card a button. Implies chevron unless set false. */
  onClick?: () => void;
  /**
   * Full-bleed image anchored to the card's bottom edge (bleeds past the
   * padding to the rounded corners). Pass a URL, or omit for no image.
   */
  image?: string;
  /** Bold caption overlaid on the bottom of the image, e.g. "EMMA SMITH". */
  imageCaption?: string;
  /** Alt text for the image; falls back to the caption or empty. */
  imageAlt?: string;
  /** Slot rendered below the body (chips, meta rows) before any image. */
  children?: ReactNode;
}

/**
 * A single layered editorial card. Use inside <StackedCards> for the overlap;
 * standalone it renders as one rounded, tinted panel.
 */
export function StackedCard({
  eyebrow,
  title,
  body,
  tint = 'sand',
  chevron,
  onClick,
  image,
  imageCaption,
  imageAlt,
  children,
}: StackedCardProps) {
  const t = TINTS[tint] ?? TINTS.sand;
  const interactive = typeof onClick === 'function';
  const showChevron = chevron ?? interactive;
  const Tag = interactive ? 'button' : 'div';

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={[
        'relative block w-full overflow-hidden rounded-[26px] text-left',
        'shadow-[0_8px_24px_rgb(var(--shadow)/0.10)]',
        interactive ? 'transition-transform active:scale-[0.985]' : '',
      ].join(' ')}
      style={{ background: t.surface }}
    >
      <div className="p-5 pb-5">
        {eyebrow && (
          <p
            className="m-0 mb-1.5 text-[13px] font-bold"
            style={{ color: t.eyebrow }}
          >
            {eyebrow}
          </p>
        )}

        <div className="flex items-start gap-2">
          <h3 className="m-0 flex-1 font-serif text-[24px] font-normal leading-[1.15] text-navy">
            {title}
          </h3>
          {showChevron && (
            <PhIcon
              name="ph-bold ph-caret-right"
              size={20}
              color="rgb(var(--sagedark))"
              className="mt-1 shrink-0"
            />
          )}
        </div>

        {body && (
          <p className="m-0 mt-3 text-[15px] font-semibold italic leading-[1.5] text-ink">
            {body}
          </p>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>

      {image && (
        <div className="relative">
          <img
            src={image}
            alt={imageAlt ?? imageCaption ?? ''}
            className="block h-[220px] w-full object-cover"
          />
          {imageCaption && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{
                  background:
                    'linear-gradient(to top, rgb(var(--navy)/0.55), transparent)',
                }}
              />
              <span className="absolute bottom-3 left-5 text-[26px] font-extrabold uppercase tracking-tight text-white">
                {imageCaption}
              </span>
            </>
          )}
        </div>
      )}
    </Tag>
  );
}

export interface StackedCardsProps {
  /** StackedCard elements to layer. */
  children: ReactNode;
  /** Vertical overlap in px between adjacent cards. Defaults to 20. */
  overlap?: number;
  className?: string;
}

/**
 * Layers its StackedCard children so each overlaps the one above by `overlap`
 * px, later cards sitting on top (their rounded top curves over the prior
 * card's bottom). The first card gets no offset.
 */
export function StackedCards({ children, overlap = 20, className }: StackedCardsProps) {
  const items = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className="relative"
          style={{ marginTop: i === 0 ? 0 : -overlap, zIndex: i + 1 }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
