import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // No service worker in native (Capacitor) builds: the native layer serves
      // the assets, and an SW just caches a stale bundle across reinstalls.
      // Build the APK with CAP_BUILD=1 to exclude it; web keeps the PWA.
      disable: process.env.CAP_BUILD === "1",
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons.svg"],
      manifest: {
        name: "Rabbithole",
        short_name: "Stumble",
        description: "A serendipitous discovery engine.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "favicon.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "favicon.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
        ],
      },
    }),
  ],
});
