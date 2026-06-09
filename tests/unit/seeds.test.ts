import { describe, it, expect } from "vitest";
import { DEFAULT_SEED_ASSETS } from "../../app/src/bootstrap";

describe("DEFAULT_SEED_ASSETS balance", () => {
  it("uses no single source more than twice", () => {
    const counts = new Map<string, number>();
    for (const a of DEFAULT_SEED_ASSETS) {
      counts.set(a.source, (counts.get(a.source) ?? 0) + 1);
    }
    const over = [...counts.entries()].filter(([, n]) => n > 2);
    expect(over).toEqual([]);
  });

  it("includes at least 4 non-article seeds (format variety)", () => {
    const nonArticle = DEFAULT_SEED_ASSETS.filter((a) => a.type !== "article");
    expect(nonArticle.length).toBeGreaterThanOrEqual(4);
  });

  it("every seed has a content type and a unique url", () => {
    const urls = new Set<string>();
    for (const a of DEFAULT_SEED_ASSETS) {
      expect(a.type).toBeDefined();
      expect(urls.has(a.url)).toBe(false);
      urls.add(a.url);
    }
  });
});
