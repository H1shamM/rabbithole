import { describe, it, expect, vi, beforeEach } from "vitest";
import { MediumSource } from "../../../app/src/sources/medium.js";

describe("MediumSource", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("fetches an English story successfully", async () => {
    const mockXml = `
      <item>
        <title><![CDATA[English Article]]></title>
        <link>https://medium.com/test</link>
        <description><![CDATA[This is the story of a great day.]]></description>
      </item>
    `;
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => `<rss><channel>${mockXml}</channel></rss>`,
    });

    const source = new MediumSource();
    const asset = await source.fetchStumble("tech");

    expect(asset).not.toBeNull();
    expect(asset?.title).toBe("English Article");
    expect(asset?.source).toBe("Medium");
  });

  it("filters out non-English stories", async () => {
    const mockXml = `
      <item>
        <title><![CDATA[Lindt: O Luxo de Partilhar o Afeto]]></title>
        <link>https://medium.com/pt-test</link>
        <description><![CDATA[Lindt descrição]]></description>
      </item>
    `;
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => `<rss><channel>${mockXml}</channel></rss>`,
    });

    const source = new MediumSource();
    const asset = await source.fetchStumble("tech");

    expect(asset).toBeNull();
  });

  it("passes English title with numbers and punctuation", async () => {
    const mockXml = `
      <item>
        <title><![CDATA[Top 7 Things: A Developer's Guide (2024)]]></title>
        <link>https://medium.com/test-eng</link>
        <description><![CDATA[This is a test.]]></description>
      </item>
    `;
    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => `<rss><channel>${mockXml}</channel></rss>`,
    });

    const source = new MediumSource();
    const asset = await source.fetchStumble("tech");

    expect(asset).not.toBeNull();
    expect(asset?.title).toBe("Top 7 Things: A Developer's Guide (2024)");
  });
});
