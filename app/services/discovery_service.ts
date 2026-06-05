import type { IStoragePort } from '../db/storage_port.js';
import type { StumbleAsset } from '../models/asset.js';
import type { ContentFetcher } from '../sources/ContentFetcher.js';

export class DiscoveryService {
  constructor(
    private storage_port: IStoragePort,
    private sources: ContentFetcher[]
  ) {}

  async stumble(category: string, history: string[]): Promise<StumbleAsset> {
    // 1. Shuffle sources to ensure variety
    const shuffledSources = [...this.sources].sort(() => Math.random() - 0.5);

    // 2. Waterfall through sources
    for (const source of shuffledSources) {
      try {
        const asset = await source.fetchStumble(category);
        
        // 3. Save live fetch to local assets table for future caching/rating
        // We use INSERT OR IGNORE or similar to avoid duplicates if URL exists
        // SQLiteAdapter handles INSERT OR REPLACE currently
        await this.storage_port.save_asset({
          ...asset,
          last_visited_at: new Date()
        });

        return asset;
      } catch (error) {
        console.error(`Source ${source.constructor.name} failed:`, error);
        continue; // Try next source
      }
    }

    // 4. Ultimate fallback: retrieve from local DB cache if all external sources fail
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
