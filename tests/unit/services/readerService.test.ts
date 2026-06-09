import { describe, it, expect } from "vitest";
import { extractReadable } from "../../../app/src/services/readerService.js";

describe("extractReadable", () => {
  it("returns null for malformed HTML (no throw)", () => {
    const result = extractReadable("<not real html", "https://x.com");
    expect(result).toBeNull();
  });

  it("returns result object for valid article HTML", () => {
    const html = '<html><head><title>Hi</title></head><body><article><h1>Hi</h1><p>Content</p></article></body></html>';
    const result = extractReadable(html, "https://example.com");
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Hi");
    expect(result?.content).toContain("<p>Content</p>");
  });
});
