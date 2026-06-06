import type { IStoragePort, RatedItem } from '../db/storage_port.js';
import type { StumbleAsset } from '../models/asset.js';
import type { ContentFetcher } from '../sources/ContentFetcher.js';

export class DiscoveryService {
  constructor(
    private storage_port: IStoragePort,
    private sources: ContentFetcher[]
  ) {}

  async get_recommendations(userId: string, limit: number): Promise<StumbleAsset[]> {
    return this.storage_port.get_recommendations(userId, limit);
  }

  async stumble(category: string, history: string[], userId: string): Promise<StumbleAsset> {
    const preferences = await (this.storage_port as any).get_user_preferences(userId);
    const assets = await (this.storage_port as any).get_all_assets(category);
    
    // ... rest of logic uses userId to filter/weight per user
    const getWeight = (asset: StumbleAsset) => {
        let weight = 1;
        const catPref = preferences.find((p: any) => p.type === 'category' && p.name === asset.category);
        const srcPref = preferences.find((p: any) => p.type === 'source' && p.name === asset.source);
        if (catPref) weight += catPref.score;
        if (srcPref) weight += srcPref.score;
        return Math.max(0.1, weight);
    };
    // ...
  }

  async rate(asset_id: string, is_positive: boolean, userId: string): Promise<void> {
    const rating = is_positive ? 'like' : 'dislike';
    const asset = await this.storage_port.get_asset_by_id(asset_id);
    if (!asset) return;

    await this.storage_port.save_rating(userId, asset_id, rating);
    await this.storage_port.update_rating(asset_id, is_positive ? 1 : -1);
    await (this.storage_port as any).update_user_preference(userId, 'category', asset.category, is_positive ? 1 : -1);
    await (this.storage_port as any).update_user_preference(userId, 'source', asset.source, is_positive ? 1 : -1);
  }

  async get_history(limit: number): Promise<RatedItem[]> {
    return this.storage_port.get_history(limit);
  }

  async addFavorite(asset_id: string): Promise<void> {
    await this.storage_port.save_favorite(asset_id);
  }

  async removeFavorite(asset_id: string): Promise<void> {
    await this.storage_port.remove_favorite(asset_id);
  }

  async getFavorites(): Promise<StumbleAsset[]> {
    return this.storage_port.get_favorites();
  }

  async get_categories(): Promise<string[]> {
    return this.storage_port.get_all_categories();
  }
}
