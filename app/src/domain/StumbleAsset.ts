export interface StumbleAsset {
  id: string;
  url: string;
  title: string;
  interest: string;
  rating: number; // Positive for likes, negative for dislikes
  createdAt: Date;
  lastVisitedAt?: Date;
}

export type CreateStumbleAssetDto = Omit<StumbleAsset, 'id' | 'createdAt' | 'rating'>;
