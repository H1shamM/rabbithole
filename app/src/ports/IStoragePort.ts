import { StumbleAsset } from '../domain/StumbleAsset';

export interface IStoragePort {
  getAssetById(id: string): Promise<StumbleAsset | null>;
  getRandomAssetByInterests(interests: string[], excludeIds: string[]): Promise<StumbleAsset | null>;
  saveAsset(asset: StumbleAsset): Promise<void>;
  updateRating(id: string, delta: number): Promise<void>;
  getAllInterests(): Promise<string[]>;
}
