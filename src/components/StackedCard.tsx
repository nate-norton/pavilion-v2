import { Children, type ReactNode } from 'react';
import { PhIcon } from './PhIcon';

/*
 * StackedCard — the layered, big-radius editorial card pattern (the LDS
 * "Gospel Living" look), rebuilt in Pavilion's warm earth tones. Cards sit in
 * a <StackedCards> stack and overlap the one below via a shared negative
 * offset, so a tinted panel's rounded bottom curves over the next card.
 *
 * Two levels of API:
 *   - <StackedCard>  — opinionated editorial card (eyebrow, serif title,
 *     body, chevron, bottom-bleed image). Use for new content.
 *   - <StackedPanel> — the bare layered surface with arbitrary children. Use
 *     to tuck existing rich content (buttons, progress bars) into a stack
 *     without rewriting it.
 *
 * Preview both at /design-system.
 */

/** Named washes → the surface plus the text colors that stay legible on it. */
const TINTS = {
  sage: { surface: 'rgb(var(--sagepale))', eyebrow: 'rgb(var(--sagedark))', title: 'rgb(var(--navy))', body: 'rgb(var(--ink))', chevron: 'rgb(var(--sagedark))' },
  skywash: { surface: 'rgb(var(--skywash))', eyebrow: 'rgb(var(--slatedark))', title: 'rgb(var(--navy))', body: 'rgb(var(--ink))', chevron: 'rgb(var(--slatedark))' },
  sunset: { surface: 'rgb(var(--sunsetpale))', eyebrow: 'rgb(var(--accent))', title: 'rgb(var(--navy))', body: 'rgb(var(--ink))', chevron: 'rgb(var(--accent))' },
  gold: { surface: 'rgb(var(--goldpale))', eyebrow: 'rgb(var(--golddark))', title: 'rgb(var(--navy))', body: 'rgb(var(--ink))', chevron: 'rgb(var(--golddark))' },
  sky: { surface: 'rgb(var(--skypale))', eyebrow: 'rgb(var(--skydeep))', title: 'rgb(var(--navy))', body: 'rgb(var(--ink))', chevron: 'rgb(var(--skydeep))' },
  paper: { surface: 'rgb(var(--paper))', eyebrow: 'rgb(var(--slate))', title: 'rgb(var(--navy))', body: 'rgb(var(--ink))', chevron: 'rgb(var(--slatefaint))' },
  /*
   * Chrome hero — the dark-surface variant. --sky is the brand primary, so a
   * hero card is sky rather than navy; navy stays available but is text-first
   * in this system. White clears 5.82 on skydeep, cream 5.34, and the
   * lightened peach eyebrow 4.52. (`sky` above is the *light* wash — distinct.)
   */
  skydeep: { surface: 'rgb(var(--skydeep))', eyebrow: 'rgb(var(--peach))', title: 'rgb(var(--mist))', body: 'rgb(var(--mist) / 0.98)', chevron: 'rgb(var(--peach))' },
  navy: { surface: 'rgb(var(--navy))', eyebrow: 'rgb(var(--peach))', title: 'rgb(var(--mist))', body: 'rgb(var(--mist) / 0.9)', chevron: 'rgb(var(--peach))' },
} as const;

export type StackedTint = keyof typeof TINTS;

const SURFACE = 'relative block w-full overflow-hidden rounded-[26px] text-left shadow-[0_8px_24px_rgb(var(--shadow)/0.10)]';

/*
 * Default padding, plus the "tuck": the next card in a stack sits on top and
 * covers this one's bottom `overlap` px, so every card except the last needs
 * that much extra bottom padding or its last line gets hidden. StackedCards
 * sets --stack-tuck per child, so this is automatic rather than a call-site
 * footgun. `flush` panels opt out and manage their own padding.
 */
const PAD = 'px-5 pt-5 pb-[calc(1.25rem+var(--stack-tuck,0px))]';

export interface StackedPanelProps {
  /** Warm wash behind the panel. Defaults to `paper`. */
  tint?: StackedTint;
  /** Drops the default padding so children can bleed to the rounded edges. */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * The bare layered surface: rounded, tinted, shadowed. Wrap existing rich
 * content in this to tuck it into a <StackedCards> stack.
 */
export function StackedPanel({ tint = 'paper', flush, className, children }: StackedPanelProps) {
  const t = TINTS[tint] ?? TINTS.paper;
  return (
    <div
      className={[SURFACE, flush ? '' : PAD, className ?? ''].filter(Boolean).join(' ')}
      style={{ background: t.surface }}
    >
      {children}
    </div>
  );
}

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
  /**
   * Makes the whole card a button. Implies a chevron unless `chevron={false}`.
   * Omit when the card contains its own buttons — nested buttons are invalid.
   */
  onClick?: () => void;
  /** Full-bleed image anchored to the card's bottom edge. */
  image?: string;
  /** Bold caption overlaid on the bottom of the image, e.g. "EMMA SMITH". */
  imageCaption?: string;
  /**
   * Heading level for the title. Defaults to `h2`: these cards are the hero
   * of a screen whose own title is the h1, so an h3 skipped a level in the
   * heading outline everywhere the card was used.
   */
  level?: 'h2' | 'h3';
  /** Alt text for the image; falls back to the caption or empty. */
  imageAlt?: string;
  /** Slot rendered below the body (chips, meta rows, actions) before any image. */
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
  tint = 'skywash',
  chevron,
  onClick,
  image,
  imageCaption,
  imageAlt,
  level = 'h2',
  children,
}: StackedCardProps) {
  const t = TINTS[tint] ?? TINTS.skywash;
  const interactive = typeof onClick === 'function';
  const showChevron = chevron ?? interactive;
  const Tag = interactive ? 'button' : 'div';
  const Heading = level;

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      onClick={onClick}
      className={[SURFACE, interactive ? 'cursor-pointer transition-transform active:scale-[0.985]' : ''].join(' ')}
      style={{ background: t.surface }}
    >
      <div className={image ? 'px-5 pt-5 pb-5' : PAD}>
        {eyebrow && (
          <p className="m-0 mb-1.5 text-[12.5px] font-bold" style={{ color: t.eyebrow }}>
            {eyebrow}
          </p>
        )}

        <div className="flex items-start gap-2">
          <Heading
            className="m-0 flex-1 font-serif text-[22px] font-normal leading-[1.18]"
            style={{ color: t.title }}
          >
            {title}
          </Heading>
          {showChevron && (
            <PhIcon name="ph-bold ph-caret-right" size={18} color={t.chevron} className="mt-1 flex-shrink-0" />
          )}
        </div>

        {body && (
          <p className="m-0 mt-2.5 text-[13.5px] font-semibold leading-[1.5]" style={{ color: t.body }}>
            {body}
          </p>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>

      {image && (
        <div className="relative pb-[var(--stack-tuck,0px)]">
          <img loading="lazy" decoding="async" src={image} alt={imageAlt ?? imageCaption ?? ''} className="block h-[200px] w-full object-cover" />
          {imageCaption && (
            <>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
                style={{ background: 'linear-gradient(to top, rgb(var(--navy) / 0.6), transparent)' }}
              />
              <span className="absolute bottom-3 left-5 text-[24px] font-extrabold uppercase tracking-tight text-white">
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
  /** StackedCard / StackedPanel elements to layer. Falsy children are skipped. */
  children: ReactNode;
  /** Vertical overlap in px between adjacent cards. Defaults to 20. */
  overlap?: number;
  className?: string;
}

/**
 * Layers its children so each overlaps the one above by `overlap` px, later
 * cards sitting on top (their rounded top curves over the prior card's
 * bottom). The first card gets no offset. Conditional (`{cond && …}`) children
 * are filtered out so they don't leave gaps in the stack.
 */
export function StackedCards({ children, overlap = 20, className }: StackedCardsProps) {
  const items = Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <div
          key={i}
          className="relative"
          style={{
            marginTop: i === 0 ? 0 : -overlap,
            zIndex: i + 1,
            // Every card but the last is covered by the next one; hand it the
            // overlap so its padding can make room. See PAD above.
            ['--stack-tuck' as string]: i === items.length - 1 ? '0px' : `${overlap}px`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
