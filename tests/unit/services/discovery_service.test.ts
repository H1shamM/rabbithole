import { describe, it, expect, vi } from "vitest";
import { DiscoveryService } from "../../../app/src/services/discoveryService";
import { IStoragePort } from "../../../app/src/db/storagePort";
import { StumbleAsset } from "../../../app/src/models/asset";

const mockStorage: IStoragePort = {
  getAssetById: vi.fn(),
  saveAsset: vi.fn(),
  updateRating: vi.fn(),
  getAllAssets: vi.fn(),
  getAllCategories: vi.fn(),
  searchAssets: vi.fn(),
  saveRating: vi.fn(),
  getHistory: vi.fn(),
  saveFavorite: vi.fn(),
  removeFavorite: vi.fn(),
  getFavorites: vi.fn(),
  updateUserPreference: vi.fn(),
  getUserPreferences: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserByProvider: vi.fn(),
  getUserById: vi.fn(),
  saveUser: vi.fn(),
  saveSubmission: vi.fn(),
  getAllSubmissions: vi.fn(),
  updateSubmissionStatus: vi.fn(),
  getRecommendations: vi
    .fn()
    .mockResolvedValue([
      {
        id: "1",
        url: "http://example.com",
        title: "Test Asset",
        source: "test",
        category: "science",
        rating: 10,
      } as StumbleAsset,
    ]),
  getRandomAssetByInterests: vi.fn(),
  getAllInterests: vi.fn(),
};

describe("DiscoveryService", () => {
  it("should return recommended assets from storage", async () => {
    const service = new DiscoveryService(mockStorage as any, []);
    const recommendations = await service.getRecommendations("user1", 5);
    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]?.title).toBe("Test Asset");
    expect(mockStorage.getRecommendations).toHaveBeenCalledWith("user1", 5);
  });
});
