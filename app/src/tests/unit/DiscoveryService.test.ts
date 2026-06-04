import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiscoveryService } from '../../domain/DiscoveryService';
import { IStoragePort } from '../../ports/IStoragePort';
import { StumbleAsset } from '../../domain/StumbleAsset';

describe('DiscoveryService', () => {
  let discoveryService: DiscoveryService;
  let mockStorage: vi.Mocked<IStoragePort>;

  const mockAsset: StumbleAsset = {
    id: '1',
    url: 'https://example.com',
    title: 'Example',
    interest: 'Space',
    rating: 0,
    createdAt: new Date()
  };

  beforeEach(() => {
    mockStorage = {
      getAssetById: vi.fn(),
      getRandomAssetByInterests: vi.fn(),
      saveAsset: vi.fn().mockResolvedValue(undefined),
      updateRating: vi.fn().mockResolvedValue(undefined),
      getAllInterests: vi.fn()
    };
    discoveryService = new DiscoveryService(mockStorage);
  });

  it('should return a random asset based on interests', async () => {
    mockStorage.getRandomAssetByInterests.mockResolvedValue(mockAsset);

    const result = await discoveryService.stumble(['Space'], []);

    expect(result).toEqual(mockAsset);
    expect(mockStorage.getRandomAssetByInterests).toHaveBeenCalledWith(['Space'], []);
    expect(mockStorage.saveAsset).toHaveBeenCalled();
  });

  it('should throw an error if no asset is found', async () => {
    mockStorage.getRandomAssetByInterests.mockResolvedValue(null);

    await expect(discoveryService.stumble(['Space'], []))
      .rejects.toThrow('No assets found for the selected interests.');
  });

  it('should update rating correctly', async () => {
    await discoveryService.rate('1', true);
    expect(mockStorage.updateRating).toHaveBeenCalledWith('1', 1);

    await discoveryService.rate('1', false);
    expect(mockStorage.updateRating).toHaveBeenCalledWith('1', -1);
  });
});
