import { describe, it, expect, vi, beforeEach } from "vitest";
import type { StumbleAsset } from "../../../app/src/models/asset";

vi.mock("../../../app/src/utils/fetchHtml.js", () => ({
  fetchHtml: vi.fn(),
}));
vi.mock("../../../app/src/services/readerService.js", () => ({
  extractReadable: vi.fn(),
}));

import {
  isVideoAsset,
  classifyAsset,
} from "../../../app/src/services/assetGate";
import { fetchHtml } from "../../../app/src/utils/fetchHtml.js";
import { extractReadable } from "../../../app/src/services/readerService.js";

const baseAsset: StumbleAsset = {
  id: "a1",
  url: "https://example.com/article",
  title: "Example",
  source: "Test",
  category: "tech",
  rating: 0,
  created_at: new Date(),
};

describe("isVideoAsset", () => {
  it("is true when proxyUrl is an /embed/ URL", () => {
    expect(
      isVideoAsset({
        url: "https://www.youtube.com/watch?v=abc",
        proxyUrl: "https://www.youtube.com/embed/abc",
      }),
    ).toBe(true);
  });

  it("is true when the url itself is an /embed/ URL and no proxyUrl", () => {
    expect(isVideoAsset({ url: "https://www.youtube.com/embed/abc" })).toBe(
      true,
    );
  });

  it("is false for a normal article url", () => {
    expect(isVideoAsset({ url: "https://example.com/article" })).toBe(false);
  });
});

describe("classifyAsset", () => {
  beforeEach(() => {
    vi.mocked(fetchHtml).mockReset();
    vi.mocked(extractReadable).mockReset();
  });

  it("classifies a video as servable without fetching the page", async () => {
    const video = { ...baseAsset, proxyUrl: "https://yt.com/embed/x" };
    await expect(classifyAsset(video)).resolves.toEqual({
      type: "video",
      servable: true,
    });
    expect(fetchHtml).not.toHaveBeenCalled();
  });

  it("classifies a known image source as image without extraction", async () => {
    const img = { ...baseAsset, source: "BoredPanda" };
    await expect(classifyAsset(img)).resolves.toEqual({
      type: "image",
      servable: true,
    });
    expect(fetchHtml).not.toHaveBeenCalled();
  });

  it("classifies a known interactive source as interactive without extraction", async () => {
    const site = { ...baseAsset, source: "UselessWeb" };
    await expect(classifyAsset(site)).resolves.toEqual({
      type: "interactive",
      servable: true,
    });
    expect(fetchHtml).not.toHaveBeenCalled();
  });

  it("classifies an extractable page as a servable article", async () => {
    vi.mocked(fetchHtml).mockResolvedValue({ html: "<html/>", headers: {} });
    vi.mocked(extractReadable).mockReturnValue({
      title: "T",
      byline: null,
      siteName: null,
      excerpt: null,
      content: "<p>x</p>",
      textContent: "x",
      length: 1,
    });
    await expect(classifyAsset(baseAsset)).resolves.toEqual({
      type: "article",
      servable: true,
    });
  });

  it("marks a non-article page as not servable", async () => {
    vi.mocked(fetchHtml).mockResolvedValue({ html: "<html/>", headers: {} });
    vi.mocked(extractReadable).mockReturnValue(null);
    await expect(classifyAsset(baseAsset)).resolves.toEqual({
      type: "article",
      servable: false,
    });
  });

  it("marks an asset as not servable when the fetch fails", async () => {
    vi.mocked(fetchHtml).mockRejectedValue(new Error("network"));
    await expect(classifyAsset(baseAsset)).resolves.toEqual({
      type: "article",
      servable: false,
    });
  });
});
