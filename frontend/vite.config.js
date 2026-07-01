import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'screenshots/*.png'],
      manifest: false, // we use our own /public/manifest.json
      workbox: {
        // Cache strategies
        runtimeCaching: [
          {
            // Cache all page navigation (offline shell)
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages-cache',
              networkTimeoutSeconds: 3,
            },
          },
          {
            // Cache JS/CSS assets aggressively
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
            },
          },
          {
            // Cache images with long TTL
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|mp4)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            // Cache fonts
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },
        ],
        // Precache the app shell
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Skip waiting so updates apply immediately
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: '/index.html',
        navigateFallbackAllowlist: [/^(?!\/__).*/],
      },
      devOptions: {
        enabled: false, // Disable service worker in dev mode to prevent HMR and routing issues
        type: 'module',
      },
    }),
  ],
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
})
