import { IStoragePort } from '../db/storage_port';
import type { StumbleAsset } from '../models/asset.js';

export class DiscoveryService {
  constructor(private storage_port: IStoragePort) {}

  async stumble(interests: string[], history: string[]): Promise<StumbleAsset> {
    const asset = await this.storage_port.get_random_asset_by_interests(interests, history);
    
    if (!asset) {
      throw new Error('No assets found for the selected interests.');
    }

    // Update last visited time (async orchestration)
    this.storage_port.save_asset({
      ...asset,
      last_visited_at: new Date()
    }).catch(err => console.error('Failed to update last_visited_at:', err));

    return asset;
  }

  async rate(asset_id: string, is_positive: boolean): Promise<void> {
    const delta = is_positive ? 1 : -1;
    await this.storage_port.update_rating(asset_id, delta);
  }

  async get_interests(): Promise<string[]> {
    return this.storage_port.get_all_interests();
  }
}
