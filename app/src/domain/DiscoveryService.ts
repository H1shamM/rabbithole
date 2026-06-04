import { IStoragePort } from '../ports/IStoragePort';
import { StumbleAsset } from './StumbleAsset';

export class DiscoveryService {
  constructor(private storagePort: IStoragePort) {}

  async stumble(interests: string[], history: string[]): Promise<StumbleAsset> {
    const asset = await this.storagePort.getRandomAssetByInterests(interests, history);
    
    if (!asset) {
      throw new Error('No assets found for the selected interests.');
    }

    // Update last visited time (async, don't block response)
    this.storagePort.saveAsset({
      ...asset,
      lastVisitedAt: new Date()
    }).catch(err => console.error('Failed to update lastVisitedAt:', err));

    return asset;
  }

  async rate(assetId: string, isPositive: boolean): Promise<void> {
    const delta = isPositive ? 1 : -1;
    await this.storagePort.updateRating(assetId, delta);
  }

  async getInterests(): Promise<string[]> {
    return this.storagePort.getAllInterests();
  }
}
