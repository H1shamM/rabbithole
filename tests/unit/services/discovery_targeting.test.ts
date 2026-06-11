import { describe, it, expect, vi } from "vitest";
import { DiscoveryService } from "../../../app/src/services/discoveryService";
import type { StumbleAsset } from "../../../app/src/models/asset";

const asset: StumbleAsset = {
  id: "a1",
  url: "https://example.com/art",
  title: "A painting",
  source: "WikiArt",
  category: "art",
  channel: "Art",
  rating: 0,
} as StumbleAsset;

describe("DiscoveryService — topic targeting (#206)", () => {
  it("skip() softly down-weights the asset's category and channel", async () => {
    const storage = {
      getAssetById: vi.fn().mockResolvedValue(asset),
      updateUserPreference: vi.fn().mockResolvedValue(undefined),
    } as never;
    const svc = new DiscoveryService(storage, []);

    await svc.skip("a1", "user1");

    expect(
      (storage as never as { updateUserPreference: ReturnType<typeof vi.fn> })
        .updateUserPreference,
    ).toHaveBeenCalledWith("user1", "category", "art", -0.34);
    expect(
      (storage as never as { updateUserPreference: ReturnType<typeof vi.fn> })
        .updateUserPreference,
    ).toHaveBeenCalledWith("user1", "channel", "Art", -0.34);
  });

  it("skip() is a no-op for a missing asset", async () => {
    const updateUserPreference = vi.fn();
    const storage = {
      getAssetById: vi.fn().mockResolvedValue(null),
      updateUserPreference,
    } as never;
    const svc = new DiscoveryService(storage, []);

    await svc.skip("nope", "user1");

    expect(updateUserPreference).not.toHaveBeenCalled();
  });

  it("rate() also updates channel affinity (a like nudges the channel up)", async () => {
    const updateUserPreference = vi.fn();
    const storage = {
      getAssetById: vi.fn().mockResolvedValue(asset),
      saveRating: vi.fn(),
      updateRating: vi.fn(),
      updateUserPreference,
    } as never;
    const svc = new DiscoveryService(storage, []);

    await svc.rate("a1", true, "user1");

    expect(updateUserPreference).toHaveBeenCalledWith("user1", "channel", "Art", 1);
    expect(updateUserPreference).toHaveBeenCalledWith("user1", "category", "art", 1);
  });
});
