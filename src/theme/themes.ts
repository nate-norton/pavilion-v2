import type { ThemeTokens } from './ThemeProvider';

export interface BrandTheme {
  key: string;
  label: string;
  /** Token overrides. Empty = the default Juniper Ridge palette. */
  tokens: ThemeTokens;
}

/**
 * Per-community brand presets. Each remaps the accent family (the CTA /
 * badge / highlight colors) while leaving navy text and surfaces intact, so
 * the app stays readable and the rebrand is unmistakable. This is the seam
 * that becomes real per-community theming once communities carry their own
 * brand tokens in the backend.
 *
 * `sunset` is a fill and may be bright. `accent` is the text-bearing
 * accent — accent copy, status pills and inline links resolve to it — so any
 * override must clear 4.5:1 against every page surface (mist, white, sand,
 * parchment) and against the theme's own accenttint, with white clearing 4.5:1 on
 * it because it also backs CTAs. `peach` sits as eyebrow text on the chrome
 * hero cards, so it is solved upward until it clears 4.5:1 on navy.
 *
 * Re-derived for the sky/sunset brand: Harbor 5.11/5.26/5.73, Meadow
 * 5.18/5.22/5.69, Plum 4.91/5.21/5.68 (accenttint / mist / white-on-it).
 */
export const BRAND_THEMES: BrandTheme[] = [
  { key: 'juniper', label: 'Juniper Ridge', tokens: {} },
  {
    key: 'harbor',
    label: 'Harbor Cove',
    tokens: {
      sunset: '74 144 226',
      accent: '30 102 186',
      peach: '95 157 229',
      accenttint: '234 243 253',
      'color-accent': 'var(--accent)',
    },
  },
  {
    key: 'meadow',
    label: 'Meadow Park',
    tokens: {
      sunset: '42 157 92',
      accent: '31 117 69',
      peach: '47 176 103',
      accenttint: '232 248 239',
      'color-accent': 'var(--accent)',
    },
  },
  {
    key: 'plum',
    label: 'Plum Hollow',
    tokens: {
      sunset: '139 92 246',
      accent: '116 60 244',
      peach: '169 134 248',
      accenttint: '241 236 253',
      'color-accent': 'var(--accent)',
    },
  },
];

export const brandTokens = (key: string): ThemeTokens =>
  BRAND_THEMES.find((t) => t.key === key)?.tokens ?? {};
