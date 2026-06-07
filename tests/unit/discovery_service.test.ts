import { describe, it, expect, vi, beforeEach } from "vitest";
import { DiscoveryService } from "../../app/src/services/discoveryService";
import type { IStoragePort } from "../../app/src/db/storagePort";
import type { StumbleAsset } from "../../app/src/models/asset";
import type { ContentFetcher } from "../../app/src/sources/ContentFetcher";

describe("DiscoveryService", () => {
  let discovery_service: DiscoveryService;
  let mock_storage: any;
  let mock_source: ContentFetcher;

  const mock_asset: StumbleAsset = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    url: "https://example.com",
    title: "Example",
    category: "science",
    source: "Test",
    rating: 0,
    created_at: new Date(),
  };

  beforeEach(() => {
    mock_storage = {
      getAssetById: vi.fn(),
      getRandomAssetByInterests: vi.fn(),
      saveAsset: vi.fn().mockResolvedValue(undefined),
      updateRating: vi.fn().mockResolvedValue(undefined),
      getAllCategories: vi.fn(),
      saveRating: vi.fn().mockResolvedValue(undefined),
      getHistory: vi.fn(),
      saveFavorite: vi.fn().mockResolvedValue(undefined),
      removeFavorite: vi.fn().mockResolvedValue(undefined),
      getFavorites: vi.fn().mockResolvedValue([]),
      updateUserPreference: vi.fn().mockResolvedValue(undefined),
      getUserPreferences: vi.fn().mockResolvedValue([]),
    };

    mock_source = {
      fetchStumble: vi.fn().mockResolvedValue(mock_asset),
    };

    discovery_service = new DiscoveryService(mock_storage as IStoragePort, [
      mock_source,
    ]);
  });

  it("should update rating correctly", async () => {
    // Mock the asset lookup
    mock_storage.getAssetById.mockResolvedValue(mock_asset);

    const assetId = mock_asset.id;
    const userId = "user-123";

    await discovery_service.rate(assetId, true, userId);

    expect(mock_storage.getAssetById).toHaveBeenCalledWith(assetId);
    expect(mock_storage.saveRating).toHaveBeenCalledWith(
      userId,
      assetId,
      "like",
    );
    expect(mock_storage.updateRating).toHaveBeenCalledWith(assetId, 1);
    expect(mock_storage.updateUserPreference).toHaveBeenCalledWith(
      userId,
      "category",
      "science",
      1,
    );
    expect(mock_storage.updateUserPreference).toHaveBeenCalledWith(
      userId,
      "source",
      "Test",
      1,
    );

    await discovery_service.rate(assetId, false, userId);
    expect(mock_storage.saveRating).toHaveBeenCalledWith(
      userId,
      assetId,
      "dislike",
    );
    expect(mock_storage.updateRating).toHaveBeenCalledWith(assetId, -1);
  });
});
