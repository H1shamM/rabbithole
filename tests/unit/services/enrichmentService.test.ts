import { describe, it, expect, vi } from "vitest";
import { firstImage, enrichReader, _clearEnrichmentCache } from "../../../app/src/services/enrichmentService.js";
import { ExplainerLLM } from "../../../app/src/services/enrichmentService.js";

describe("firstImage junk filter", () => {
  it("skips junk images", () => {
    const html = `
      <img src="https://example.com/logo.png" />
      <img src="https://example.com/icon.svg" />
      <img src="https://example.com/avatar.jpg" />
      <img src="https://example.com/hero.jpg" />
    `;
    expect(firstImage(html)).toBe("https://example.com/hero.jpg");
  });
});

describe("enrichReader", () => {
  it("junk-filters logo images and falls back", async () => {
    _clearEnrichmentCache();
    const reader = {
      title: "Title",
      textContent: "Text",
      content: '<div><img src="https://example.com/logo.png" /><img src="https://example.com/hero.jpg" /></div>',
      siteName: "Site",
    } as any;
    const url = "https://example.com";
    const llm = {
      summarize: vi.fn().mockResolvedValue({ summary: "Summary" }),
    } as unknown as ExplainerLLM;

    const result = await enrichReader(reader, url, reader.content, llm);
    
    expect(result?.image).toBe("https://example.com/hero.jpg");
  });
});
