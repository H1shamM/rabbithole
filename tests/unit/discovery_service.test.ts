import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscoveryService } from '../../app/services/discovery_service';
import { IStoragePort } from '../../app/db/storage_port';
import { StumbleAsset } from '../../app/models/asset';

describe('DiscoveryService', () => {
  let discovery_service: DiscoveryService;
  let mock_storage: vi.Mocked<IStoragePort>;

  const mock_asset: StumbleAsset = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    url: 'https://example.com',
    title: 'Example',
    interest: 'Space',
    rating: 0,
    created_at: new Date()
  };

  beforeEach(() => {
    mock_storage = {
      get_asset_by_id: vi.fn(),
      get_random_asset_by_interests: vi.fn(),
      save_asset: vi.fn().mockResolvedValue(undefined),
      update_rating: vi.fn().mockResolvedValue(undefined),
      get_all_interests: vi.fn()
    } as any;
    discovery_service = new DiscoveryService(mock_storage);
  });

  it('should return a random asset based on interests', async () => {
    mock_storage.get_random_asset_by_interests.mockResolvedValue(mock_asset);

    const result = await discovery_service.stumble(['Space'], []);

    expect(result).toEqual(mock_asset);
    expect(mock_storage.get_random_asset_by_interests).toHaveBeenCalledWith(['Space'], []);
    expect(mock_storage.save_asset).toHaveBeenCalled();
  });

  it('should throw an error if no asset is found', async () => {
    mock_storage.get_random_asset_by_interests.mockResolvedValue(null);

    await expect(discovery_service.stumble(['Space'], []))
      .rejects.toThrow('No assets found for the selected interests.');
  });

  it('should update rating correctly', async () => {
    await discovery_service.rate('1', true);
    expect(mock_storage.update_rating).toHaveBeenCalledWith('1', 1);

    await discovery_service.rate('1', false);
    expect(mock_storage.update_rating).toHaveBeenCalledWith('1', -1);
  });
});
