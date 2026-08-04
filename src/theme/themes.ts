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
 * `ember` is a fill and may be bright. `terracotta` is the text-bearing
 * accent — accent copy, status pills and inline links resolve to it — so any
 * override must clear 4.5:1 against both cream (245 240 230) and the theme's
 * own blush. Harbor measures 6.05/6.13 and Plum 5.67/5.56; Meadow's original
 * value did not clear and was darkened.
 */
export const BRAND_THEMES: BrandTheme[] = [
  { key: 'juniper', label: 'Juniper Ridge', tokens: {} },
  {
    key: 'harbor',
    label: 'Harbor Cove',
    tokens: {
      ember: '58 115 181',
      terracotta: '46 92 145',
      peach: '116 160 210',
      blush: '234 243 253',
      'color-accent': 'var(--terracotta)',
    },
  },
  {
    key: 'meadow',
    label: 'Meadow Park',
    tokens: {
      ember: '42 157 92',
      // 34 128 73 measured 4.44:1 on this theme's blush and 4.35:1 on cream,
      // below AA for the accent text this token carries. Darkened to 5.48/5.36.
      terracotta: '30 112 64',
      peach: '116 185 146',
      blush: '233 246 238',
      'color-accent': 'var(--terracotta)',
    },
  },
  {
    key: 'plum',
    label: 'Plum Hollow',
    tokens: {
      ember: '139 92 246',
      terracotta: '109 66 200',
      peach: '183 155 240',
      blush: '241 236 253',
      'color-accent': 'var(--terracotta)',
    },
  },
];

export const brandTokens = (key: string): ThemeTokens =>
  BRAND_THEMES.find((t) => t.key === key)?.tokens ?? {};
