import { describe, it, expect, vi, beforeEach } from "vitest";
import type { StumbleAsset } from "../../../app/src/models/asset";
import type { IStoragePort } from "../../../app/src/db/storagePort";
import type { ContentFetcher } from "../../../app/src/sources/ContentFetcher";

vi.mock("../../../app/src/services/assetGate.js", () => ({
  isServableAsset: vi.fn(),
}));

import { DiscoveryService } from "../../../app/src/services/discoveryService";
import { isServableAsset } from "../../../app/src/services/assetGate.js";

const asset = (id: string): StumbleAsset => ({
  id,
  url: `https://example.com/${id}`,
  title: `Asset ${id}`,
  source: "Test",
  category: "tech",
  rating: 0,
  created_at: new Date(),
});

const tick = () => new Promise((r) => setTimeout(r, 10));

describe("DiscoveryService eager growth + quality gate", () => {
  let storage: any;
  let source: ContentFetcher;

  beforeEach(() => {
    vi.mocked(isServableAsset).mockReset();
    storage = {
      getAllAssets: vi.fn(),
      getUserPreferences: vi.fn().mockResolvedValue([]),
      saveAsset: vi.fn().mockResolvedValue(undefined),
    };
    source = { fetchStumble: vi.fn() };
  });

  const build = () =>
    new DiscoveryService(storage as IStoragePort, [source]);

  it("cold start (<5): fetches a servable asset and saves it", async () => {
    const fresh = asset("fresh");
    storage.getAllAssets
      .mockResolvedValueOnce([]) // first read: empty pool
      .mockResolvedValueOnce([fresh]); // after save
    vi.mocked(source.fetchStumble).mockResolvedValue(fresh);
    vi.mocked(isServableAsset).mockResolvedValue(true);

    const result = await build().stumble("tech", [], "user1");

    expect(source.fetchStumble).toHaveBeenCalled();
    expect(storage.saveAsset).toHaveBeenCalledWith(fresh);
    expect(result.id).toBe("fresh");
  });

  it("cold start: rejects an unservable asset (gate fails -> not saved)", async () => {
    storage.getAllAssets.mockResolvedValue([]); // stays empty (gate rejected)
    vi.mocked(source.fetchStumble).mockResolvedValue(asset("junk"));
    vi.mocked(isServableAsset).mockResolvedValue(false);

    await expect(build().stumble("tech", [], "user1")).rejects.toThrow();
    expect(storage.saveAsset).not.toHaveBeenCalled();
  });

  it("saturated pool (>=20): serves from pool without fetching", async () => {
    const pool = Array.from({ length: 20 }, (_, i) => asset(`p${i}`));
    storage.getAllAssets.mockResolvedValue(pool);

    const result = await build().stumble("tech", [], "user1");

    expect(source.fetchStumble).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });

  it("warm pool (5..19): serves immediately and tops up in the background", async () => {
    const pool = Array.from({ length: 10 }, (_, i) => asset(`p${i}`));
    const bg = asset("bg");
    storage.getAllAssets.mockResolvedValue(pool);
    vi.mocked(source.fetchStumble).mockResolvedValue(bg);
    vi.mocked(isServableAsset).mockResolvedValue(true);

    const result = await build().stumble("tech", [], "user1");
    expect(result).toBeDefined(); // served from the existing pool

    await tick(); // let the fire-and-forget top-up run
    expect(source.fetchStumble).toHaveBeenCalled();
    expect(storage.saveAsset).toHaveBeenCalledWith(bg);
  });
});
