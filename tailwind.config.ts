import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import type { Config } from 'tailwindcss';


// Every token defined on :root becomes a Tailwind colour of the same name.
const ROOT_CSS = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), 'src/index.css'),
  'utf8',
);
const TOKEN_COLORS = Object.fromEntries(
  [...ROOT_CSS.matchAll(/^\s*--([a-z0-9-]+):\s*[\d]+ [\d]+ [\d]+;/gm)].map(([, name]) => [
    name,
    `rgb(var(--${name}) / <alpha-value>)`,
  ]),
);

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /*
       * Generated from the :root block in src/index.css rather than listed by
       * hand. The hand-written map drifted during the palette rename — its
       * keys stayed warm while the values moved, so `text-mist` and
       * `bg-sunsetdeep` silently did not exist and their elements fell back to
       * black. Deriving the keys makes that class of bug impossible.
       */
      colors: {
        ...TOKEN_COLORS,
        // Semantic aliases — prefer these in new/redesigned UI.
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
      },
      fontFamily: {
        // Display/headlines. The `serif` key is historical — ~96 call sites
        // use `font-serif` — but the brand display face is Nunito Black.
        serif: ["'Nunito'", 'system-ui', 'sans-serif'],
        display: ["'Nunito'", 'system-ui', 'sans-serif'],
        sans: ["'Nunito Sans'", 'system-ui', 'sans-serif'],
      },
      animation: {
        scpop: 'scPop 0.35s ease both',
        fadeup: 'scFadeUp 0.3s ease both',
        sheetup: 'sheetUp 0.32s cubic-bezier(0.32,1.2,0.5,1) both',
        heartpop: 'heartPop 0.35s cubic-bezier(0.32,1.2,0.5,1)',
        scrimfade: 'scrimFadeIn 0.25s ease both',
        sheetdown: 'sheetDown 0.24s cubic-bezier(0.4,0,1,1) both',
        scrimfadeout: 'scrimFadeOut 0.22s ease both',
        slideleft: 'slideLeft 0.3s cubic-bezier(0.22,1,0.36,1) both',
        slideright: 'slideRight 0.3s cubic-bezier(0.22,1,0.36,1) both',
        msgbubble: 'msgBubble 0.28s cubic-bezier(0.22,1,0.36,1) both',
        skeleton: 'skeletonPulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
