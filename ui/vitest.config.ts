import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      provider: "v8",
      // The committed coverage floor — CI fails if coverage drops below this.
      // Ratchet these UP over time; never down. Measured baseline 2026-06-13:
      // stmts 73.66 / branch 74.80 / funcs 64.72 / lines 75.41.
      thresholds: {
        statements: 73,
        branches: 74,
        functions: 64,
        lines: 75,
      },
    },
  },
});
