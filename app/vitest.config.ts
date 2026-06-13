import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["../tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // The committed coverage floor — CI fails if coverage drops below this.
      // Ratchet these UP over time; never down. Measured baseline 2026-06-13
      // (once fixtures were made hermetic, #306): stmts 69.23 / branch 65.91 /
      // funcs 68.42 / lines 72.12.
      thresholds: {
        statements: 69,
        branches: 65,
        functions: 68,
        lines: 72,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
