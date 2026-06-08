import { describe, it, expect, vi, beforeEach } from "vitest";
import { XkcdSource } from "../../../app/src/sources/xkcd.js";

describe("XkcdSource", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("fetches a random comic successfully", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ num: 100 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ num: 42, title: "Test", alt: "alt text" }),
      });

    const source = new XkcdSource();
    const asset = await source.fetchStumble("random");

    expect(asset).not.toBeNull();
    expect(asset?.url).toBe("https://xkcd.com/42/");
    expect(asset?.title).toBe("xkcd: Test");
    expect(asset?.source).toBe("xkcd");
  });

  it("returns null on fetch failure", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    const source = new XkcdSource();
    const asset = await source.fetchStumble("random");

    expect(asset).toBeNull();
  });
});
