import { StumbleAsset } from '../models/asset';

export interface IStoragePort {
  get_asset_by_id(id: string): Promise<StumbleAsset | null>;
  get_random_asset_by_interests(interests: string[], exclude_ids: string[]): Promise<StumbleAsset | null>;
  save_asset(asset: StumbleAsset): Promise<void>;
  update_rating(id: string, delta: number): Promise<void>;
  get_all_interests(): Promise<string[]>;
}
