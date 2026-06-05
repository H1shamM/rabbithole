import type { IStoragePort } from '../db/storage_port.js';
import type { StumbleAsset } from '../models/asset.js';
import type { ContentFetcher } from '../sources/ContentFetcher.js';

export class DiscoveryService {
  constructor(
    private storage_port: IStoragePort,
    private sources: ContentFetcher[]
  ) {}

  async stumble(category: string, history: string[]): Promise<StumbleAsset> {
    const shuffledSources = [...this.sources].sort(() => Math.random() - 0.5);

    for (const source of shuffledSources) {
      try {
        const asset = await source.fetchStumble(category);
        
        await this.storage_port.save_asset({
          ...asset,
          last_visited_at: new Date()
        });

        return asset;
      } catch (error) {
        console.error(`Source ${source.constructor.name} failed:`, error);
        continue;
      }
    }

    const fallbackAsset = await this.storage_port.get_random_asset_by_category(category, history);
    if (fallbackAsset) {
      return fallbackAsset;
    }

    throw new Error(`No content available for category: ${category}`);
  }

  async rate(asset_id: string, is_positive: boolean): Promise<void> {
    const delta = is_positive ? 1 : -1;
    await this.storage_port.update_rating(asset_id, delta);
  }

  async get_categories(): Promise<string[]> {
    return this.storage_port.get_all_categories();
  }
}
