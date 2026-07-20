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
      terracotta: '34 128 73',
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
