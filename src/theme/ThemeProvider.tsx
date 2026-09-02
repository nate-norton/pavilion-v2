import type { CSSProperties, ReactNode } from 'react';

/**
 * Map of design-token name (without the leading `--`) to a CSS value.
 * Values are normally space-separated RGB triplets to match the token
 * contract (e.g. `'30 58 95'`), but may also reference another token
 * (e.g. `'var(--sunset)'`).
 */
export type ThemeTokens = Record<string, string>;

export interface ThemeProviderProps {
  /** Token overrides applied to this subtree. Omit for the default palette. */
  tokens?: ThemeTokens;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Applies token overrides as CSS custom properties on a wrapping element.
 * Anything inside that references `rgb(var(--token))` picks up the override,
 * so a whole app (or a single community's subtree) can be rebranded by
 * passing a different `tokens` map — no component changes required.
 */
export function ThemeProvider({ tokens, children, className, style }: ThemeProviderProps) {
  const varStyle: Record<string, string> = {};
  if (tokens) {
    for (const [name, value] of Object.entries(tokens)) {
      varStyle[`--${name}`] = value;
    }
  }
  return (
    <div className={className} style={{ ...varStyle, ...style } as CSSProperties}>
      {children}
    </div>
  );
}
