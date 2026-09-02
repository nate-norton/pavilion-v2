import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Raw ramp — resolves to CSS vars in src/index.css so alpha modifiers
        // (e.g. bg-navy/20) still work via <alpha-value>.
        navy: 'rgb(var(--navy) / <alpha-value>)',
        cream: 'rgb(var(--cream) / <alpha-value>)',
        paper: 'rgb(var(--paper) / <alpha-value>)',
        sand: 'rgb(var(--sand) / <alpha-value>)',
        parchment: 'rgb(var(--parchment) / <alpha-value>)',
        ember: 'rgb(var(--ember) / <alpha-value>)',
        emberdeep: 'rgb(var(--emberdeep) / <alpha-value>)',
        terracotta: 'rgb(var(--terracotta) / <alpha-value>)',
        blush: 'rgb(var(--blush) / <alpha-value>)',
        peach: 'rgb(var(--peach) / <alpha-value>)',
        sage: 'rgb(var(--sage) / <alpha-value>)',
        mint: 'rgb(var(--mint) / <alpha-value>)',
        sagedark: 'rgb(var(--sagedark) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        goldpale: 'rgb(var(--goldpale) / <alpha-value>)',
        golddark: 'rgb(var(--golddark) / <alpha-value>)',
        sky: 'rgb(var(--sky) / <alpha-value>)',
        skydeep: 'rgb(var(--skydeep) / <alpha-value>)',
        skypale: 'rgb(var(--skypale) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        stone: 'rgb(var(--stone) / <alpha-value>)',
        stonelight: 'rgb(var(--stonelight) / <alpha-value>)',
        bark: 'rgb(var(--bark) / <alpha-value>)',
        taupe: 'rgb(var(--taupe) / <alpha-value>)',
        red: 'rgb(var(--red) / <alpha-value>)',
        // Semantic aliases — prefer these in new/redesigned UI.
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
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
        slideleft: 'slideLeft 0.3s cubic-bezier(0.22,1,0.36,1) both',
        slideright: 'slideRight 0.3s cubic-bezier(0.22,1,0.36,1) both',
        msgbubble: 'msgBubble 0.28s cubic-bezier(0.22,1,0.36,1) both',
        skeleton: 'skeletonPulse 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
