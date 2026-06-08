import { describe, it, expect, vi, beforeEach } from "vitest";
import { LobstersSource } from "../../../app/src/sources/lobsters.js";

describe("LobstersSource", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("fetches a random story successfully", async () => {
    const mockStory = {
      title: "Test Tech Story",
      short_id: "test1",
      score: 10,
    };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [mockStory],
    });

    const source = new LobstersSource();
    const asset = await source.fetchStumble("tech");

    expect(asset).not.toBeNull();
    expect(asset?.title).toBe("Test Tech Story");
    expect(asset?.url).toBe("https://lobste.rs/s/test1");
    expect(asset?.source).toBe("Lobsters");
  });

  it("returns null on fetch failure", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
    });

    const source = new LobstersSource();
    const asset = await source.fetchStumble("tech");

    expect(asset).toBeNull();
  });
});
