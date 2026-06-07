import type { IStoragePort, RatedItem } from "../db/storagePort.js";
import { AppError } from "../middleware/errorHandler.js";
import type { StumbleAsset } from "../models/asset.js";
import type { ContentFetcher } from "../sources/ContentFetcher.js";

export class DiscoveryService {
  constructor(
    private storage: IStoragePort,
    private sources: ContentFetcher[],
  ) {}

  async getRecommendations(
    userId: string,
    limit: number,
  ): Promise<StumbleAsset[]> {
    return this.storage.getRecommendations(userId, limit);
  }

  async stumble(
    category: string,
    history: string[],
    userId: string,
  ): Promise<StumbleAsset> {
    const preferences = await this.storage.getUserPreferences(userId);
    let assets = await this.storage.getAllAssets(category);

    // If database has fewer than 5 assets, try to fetch from live sources
    if (assets.length < 5) {
      console.log(
        `Only ${assets.length} assets in DB, fetching from live sources...`,
      );
      const newAsset = await this.fetchFromLiveSources(category);
      if (newAsset) {
        await this.storage.saveAsset(newAsset);
        assets = await this.storage.getAllAssets(category);
      }
    }

    const availableAssets = assets.filter(
      (a: StumbleAsset) => !history.includes(a.id),
    );
    if (availableAssets.length === 0) throw new Error("No assets found");

    const weightedAssets = availableAssets.map((asset: StumbleAsset) => {
      let weight = 1;
      const catPref = preferences.find(
        (p) => p.type === "category" && p.name === asset.category,
      );
      const srcPref = preferences.find(
        (p) => p.type === "source" && p.name === asset.source,
      );
      if (catPref) weight += catPref.score;
      if (srcPref) weight += srcPref.score;
      return { asset, weight: Math.max(0.1, weight) };
    });
    const totalWeight = weightedAssets.reduce(
      (sum: number, item: { weight: number }) => sum + item.weight,
      0,
    );
    let random = Math.random() * totalWeight;
    for (const item of weightedAssets) {
      random -= item.weight;
      if (random <= 0) return item.asset;
    }
    if (weightedAssets[0]) return weightedAssets[0].asset;
    throw new Error("No assets available to stumble");
  }

  private async fetchFromLiveSources(
    category: string,
  ): Promise<StumbleAsset | null> {
    // Shuffle sources to try random ones
    const shuffled = [...this.sources];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      if (temp !== undefined && shuffled[j] !== undefined) {
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }
    }

    for (const source of shuffled) {
      if (!source) continue;
      try {
        const asset = await source.fetchStumble(category);
        if (asset && asset.url && asset.title) {
          console.log(`Fetched new asset from ${asset.source}`);
          return asset;
        }
      } catch (error) {
        console.error(`Failed to fetch from source:`, error);
      }
    }
    return null;
  }

  async rate(
    assetId: string,
    isPositive: boolean,
    userId: string,
  ): Promise<void> {
    const rating = isPositive ? "like" : "dislike";
    const asset = await this.storage.getAssetById(assetId);
    if (!asset) throw new AppError("Asset not found", 404);
    await this.storage.saveRating(userId, assetId, rating);
    await this.storage.updateRating(assetId, isPositive ? 1 : -1);
    await this.storage.updateUserPreference(
      userId,
      "category",
      asset.category,
      isPositive ? 1 : -1,
    );
    await this.storage.updateUserPreference(
      userId,
      "source",
      asset.source,
      isPositive ? 1 : -1,
    );
  }

  async getHistory(userId: string, limit: number): Promise<RatedItem[]> {
    return this.storage.getHistory(userId, limit);
  }

  async addFavorite(userId: string, assetId: string): Promise<void> {
    await this.storage.saveFavorite(userId, assetId);
  }

  async removeFavorite(userId: string, assetId: string): Promise<void> {
    await this.storage.removeFavorite(userId, assetId);
  }

  async getFavorites(userId: string): Promise<StumbleAsset[]> {
    return this.storage.getFavorites(userId);
  }

  async getCategories(): Promise<string[]> {
    return this.storage.getAllCategories();
  }
}
