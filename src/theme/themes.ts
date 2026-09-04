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
      sunset: '100 160 230',
      sunsetdeep: '52 103 162',
      sunsetbright: '130 186 245',
      sunsetdim: '220 235 251',
      sunsetpale: '244 249 255',
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
      sunset: '47 177 104',
      sunsetdeep: '31 117 69',
      sunsetbright: '111 211 156',
      sunsetdim: '219 240 228',
      sunsetpale: '240 250 245',
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
      sunset: '173 140 249',
      sunsetdeep: '91 47 189',
      sunsetbright: '178 150 250',
      sunsetdim: '233 224 253',
      sunsetpale: '248 245 254',
      accent: '116 60 244',
      peach: '169 134 248',
      accenttint: '241 236 253',
      'color-accent': 'var(--accent)',
    },
  },
];

export const brandTokens = (key: string): ThemeTokens =>
  BRAND_THEMES.find((t) => t.key === key)?.tokens ?? {};
