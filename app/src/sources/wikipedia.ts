/**
 * @fileoverview Wikipedia content fetcher.
 */

import crypto from 'crypto';
import type { ContentFetcher } from './ContentFetcher.js';
import type { StumbleAsset } from '../models/asset.js';
import { fetchWithTimeout } from './utils.js';

/**
 * Wikipedia API response interface.
 */
interface WikipediaApiResponse {
  content_urls: { desktop: { page: string } };
  title: string;
  extract: string;
}

/**
 * Wikipedia content fetcher implementation.
 */
export class WikipediaSource implements ContentFetcher {
  private readonly API_URL = 'https://en.wikipedia.org/api/rest_v1/page/random/summary';

  /**
   * Fetches a random Wikipedia page summary.
   * @param {string} category - The requested category.
   * @returns {Promise<StumbleAsset | null>}
   */
  async fetchStumble(category: string): Promise<StumbleAsset | null> {
    try {
      const response = await fetchWithTimeout(this.API_URL);
      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.statusText}`);
      }
      const data = (await response.json()) as WikipediaApiResponse;
      
      return {
        id: crypto.randomUUID(),
        url: data.content_urls.desktop.page,
        title: data.title,
        description: data.extract,
        source: 'Wikipedia',
        category: category === 'all' ? 'science' : category,
        rating: 0,
        created_at: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch stumble from Wikipedia, returning null:', error);
      return null;
    }
  }
}
