import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#1A3352', cream: '#F5F0E6', paper: '#FFFEFA', sand: '#EDE6D6',
        parchment: '#F9F5EC', ember: '#E06A3E', terracotta: '#C75A31',
        blush: '#FBEDE4', peach: '#E8A788', sage: '#2A9D5C', mint: '#E9F6EE',
        sagedark: '#228049', gold: '#D9A441', goldpale: '#FBF3E0',
        golddark: '#A87B1F', sky: '#4A90E2', skydeep: '#3A73B5',
        skypale: '#EAF3FD', ink: '#3E4C63', stone: '#8A8375',
        stonelight: '#A39B8B', bark: '#5B554A', taupe: '#7A7365', red: '#C7402E',
      },
      fontFamily: {
        serif: ["'Young Serif'", 'serif'],
        sans: ["'Nunito Sans'", 'system-ui', 'sans-serif'],
      },
      animation: {
        scpop: 'scPop 0.35s ease both',
        fadeup: 'scFadeUp 0.3s ease both',
        sheetup: 'sheetUp 0.35s cubic-bezier(0.22,1,0.36,1) both',
        heartpop: 'heartPop 0.35s ease',
      },
    },
  },
  plugins: [],
} satisfies Config;
