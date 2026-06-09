import { describe, it, expect, vi } from "vitest";
import { DiscoveryService } from "../../../app/src/services/discoveryService.js";
import type { IStoragePort } from "../../../app/src/db/storagePort.js";
import type { StumbleAsset } from "../../../app/src/models/asset.js";

describe("DiscoveryService Cooldown", () => {
  it("applies cooldown to recent sources", async () => {
    const assets: StumbleAsset[] = [
      { id: "1", url: "url1", title: "T1", source: "A", category: "C", rating: 0, created_at: new Date() },
      { id: "2", url: "url2", title: "T2", source: "A", category: "C", rating: 0, created_at: new Date() },
      { id: "3", url: "url3", title: "T3", source: "B", category: "C", rating: 0, created_at: new Date() },
    ];
    const storage: IStoragePort = {
      getAllAssets: vi.fn().mockResolvedValue(assets),
      getUserPreferences: vi.fn().mockResolvedValue([]),
      // ... mock other required methods
    } as any;
    const discoveryService = new DiscoveryService(storage, []);
    
    // History includes source A
    const history = ["1"]; // Source A
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // Force selection of the non-A asset if weights allow

    const asset = await discoveryService.stumble("C", history, "user1");
    expect(asset.source).toBe("B");
  });
});
