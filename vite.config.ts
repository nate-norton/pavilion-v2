/// <reference types="vitest/config" />
import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pavilion',
        short_name: 'Pavilion',
        theme_color: '#EEF6FF',
        background_color: '#EEF6FF',
        display: 'standalone',
        icons: [{ src: '/pavilion-icon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      /*
       * Caching policy: hashed assets forever, HTML never.
       *
       * Pavilion is online-only (every screen reads Supabase) and is opened
       * from invite links and notices, so a stale index.html is the worst
       * cache outcome: it references the previous build's assets and a person
       * tapping a fresh link lands on last week's front door. So index.html
       * is kept out of the precache and every navigation goes network-first
       * (Vercel serves it must-revalidate), falling back to cache only when
       * the network is genuinely gone. The /assets/* files carry a content
       * hash in their names, so precaching them is always safe, and
       * autoUpdate + cleanupOutdatedCaches means a deploy is visible on the
       * very next open — no double reload, no "refresh to update" banner.
       */
      workbox: {
        globPatterns: ['**/*.{js,css,woff2,svg,png,ico,webmanifest}'],
        navigateFallback: null,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'pavilion-html', networkTimeoutSeconds: 3 },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
