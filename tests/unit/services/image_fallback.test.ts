import { describe, it, expect, vi } from "vitest";
import { firstImage } from "../../../app/src/services/enrichmentService";

describe("firstImage junk filtering", () => {
  it("rejects images with 'logo', 'icon', 'avatar', 'spacer' in URL", () => {
    expect(firstImage('<img src="https://cdn.test/logo.png" />')).toBeNull();
    expect(firstImage('<img src="https://cdn.test/myicon.jpg" />')).toBeNull();
    expect(firstImage('<img src="https://cdn.test/avatar_123.png" />')).toBeNull();
    expect(firstImage('<img src="https://cdn.test/spacer.gif" />')).toBeNull();
  });

  it("rejects images with small dimensions in attributes", () => {
    // 1x1
    expect(firstImage('<img src="https://cdn.test/ok.png" width="1" height="1" />')).toBeNull();
    // Tiny (likely icons)
    expect(firstImage('<img src="https://cdn.test/ok.png" width="16" height="16" />')).toBeNull();
    expect(firstImage('<img src="https://cdn.test/ok.png" width="32" height="32" />')).toBeNull();
  });

  it("accepts larger images", () => {
    expect(firstImage('<img src="https://cdn.test/hero.png" width="800" height="600" />')).toBe("https://cdn.test/hero.png");
    // No dimensions provided - default to accepting if URL is clean
    expect(firstImage('<img src="https://cdn.test/hero.png" />')).toBe("https://cdn.test/hero.png");
  });
});

import { enrichReader, _clearEnrichmentCache } from "../../../app/src/services/enrichmentService";
import type { ReaderResult } from "../../../app/src/services/readerService";

const mockReader = (content: string): ReaderResult => ({
  title: "Test",
  byline: null,
  siteName: "test.com",
  excerpt: null,
  content,
  textContent: "Long enough text content to pass enrichment minimum length checks.".repeat(10),
  length: 500,
});

describe("enrichReader image fallback sequence", () => {
  beforeEach(() => _clearEnrichmentCache());

  const mockLLM = { 
    summarize: vi.fn().mockResolvedValue({ 
      summary: "Summary", 
      keyPoints: [], 
      scenes: [] 
    }) 
  };

  it("prefers firstImage from content if it's high quality", async () => {
    const html = '<html><head><meta property="og:image" content="https://test.com/og.png" /></head><body><img src="https://test.com/hero.png" width="800" /></body></html>';
    const result = await enrichReader(mockReader(html), "https://test.com/a", mockLLM);
    expect(result!.image).toBe("https://test.com/hero.png");
  });

  it("falls back to og:image if firstImage is junk", async () => {
    const html = '<html><head><meta property="og:image" content="https://test.com/og.png" /></head><body><img src="https://test.com/logo.png" /></body></html>';
    const result = await enrichReader(mockReader(html), "https://test.com/a", mockLLM, html);
    expect(result!.image).toBe("https://test.com/og.png");
  });

  it("falls back to screenshot if both firstImage and og:image are missing/junk", async () => {
    const html = '<html><head></head><body>No images here</body></html>';
    const url = "https://test.com/a";
    const result = await enrichReader(mockReader(html), url, mockLLM);
    expect(result!.image).toContain("s.wordpress.com/mshots");
    expect(result!.image).toContain(encodeURIComponent(url));
  });
});
