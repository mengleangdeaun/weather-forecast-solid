import path from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/weather-forecast-solid/",
  plugins: [
    solidPlugin(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.png",
        "apple-touch-icon.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
        "maskable-icon-512x512.png",
      ],
      manifest: {
        name: "ការព្យាករណ៍អាកាសធាតុកម្ពុជា · Cambodia Weather Forecast",
        short_name: "អាកាសធាតុកម្ពុជា",
        description:
          "Real-time weather forecast and interactive map for 25 provinces across Cambodia powered by Solid.js and MEF Open Data API",
        theme_color: "#1d4ed8",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/weather-forecast-solid/",
        scope: "/weather-forecast-solid/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/data\.mef\.gov\.kh\/api\/v1\/realtime-api\/weather/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "mef-weather-api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 24 hours
              },
              networkTimeoutSeconds: 3,
            },
          },
          {
            urlPattern: /^https:\/\/mt1\.google\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-map-tiles-cache",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 14 * 24 * 60 * 60, // 14 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.weatherapi\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "weather-condition-icons",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
});
