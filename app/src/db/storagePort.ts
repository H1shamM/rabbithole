import type { StumbleAsset } from "../models/asset.js";
import type { User } from "../models/user.js";
import type { Submission } from "../models/submission.js";

export interface RatedItem extends StumbleAsset {
  rating_val: "like" | "dislike";
  timestamp: Date;
}

export interface IStoragePort {
  // Asset methods
  getAssetById(id: string): Promise<StumbleAsset | null>;
  saveAsset(asset: StumbleAsset): Promise<void>;
  updateRating(id: string, delta: number): Promise<void>;
  getAllAssets(category: string): Promise<StumbleAsset[]>;
  getAllCategories(): Promise<string[]>;
  searchAssets(query: string): Promise<StumbleAsset[]>;

  // Rating & History
  saveRating(
    user_id: string,
    asset_id: string,
    rating: "like" | "dislike",
  ): Promise<void>;
  getHistory(user_id: string, limit: number): Promise<RatedItem[]>;

  // Favorites
  saveFavorite(user_id: string, asset_id: string): Promise<void>;
  removeFavorite(user_id: string, asset_id: string): Promise<void>;
  getFavorites(user_id: string): Promise<StumbleAsset[]>;

  // User preferences
  updateUserPreference(
    user_id: string,
    type: "category" | "source" | "channel",
    name: string,
    delta: number,
  ): Promise<void>;
  getUserPreferences(
    user_id: string,
  ): Promise<{ type: string; name: string; score: number }[]>;

  // User auth
  findUserByEmail(email: string): Promise<User | null>;
  findUserByProvider(
    provider: string,
    provider_id: string,
  ): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  saveUser(user: User): Promise<void>;

  // Submissions
  saveSubmission(submission: Submission): Promise<void>;
  getAllSubmissions(): Promise<Submission[]>;
  updateSubmissionStatus(
    id: string,
    status: "approved" | "rejected",
  ): Promise<void>;

  // Recommendations
  getRecommendations(user_id: string, limit: number): Promise<StumbleAsset[]>;
  getRandomAssetByInterests(
    interests: string[],
    exclude_ids: string[],
  ): Promise<StumbleAsset | null>;
  getAllInterests(): Promise<string[]>;
}
