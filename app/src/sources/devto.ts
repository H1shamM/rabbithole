/**
 * @fileoverview Dev.to content fetcher.
 */

import crypto from 'crypto';
import type { ContentFetcher } from './ContentFetcher.js';
import type { StumbleAsset } from '../models/asset.js';
import { fetchWithTimeout } from './utils.js';

/**
 * Dev.to API article interface.
 */
interface DevToArticle {
  url: string;
  title: string;
  user: { name: string };
}

/**
 * Dev.to content fetcher implementation.
 */
export class DevToSource implements ContentFetcher {
  private readonly API_URL = 'https://dev.to/api/articles?top=7';

  /**
   * Fetches a random Dev.to article.
   * @param {string} _category - The requested category (unused).
   * @returns {Promise<StumbleAsset | null>}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchStumble(category: string): Promise<StumbleAsset | null> {
    try {
      const response = await fetchWithTimeout(this.API_URL);
      if (!response.ok) {
        throw new Error(`Dev.to API error: ${response.statusText}`);
      }
      const articles = (await response.json()) as DevToArticle[];
      if (articles.length === 0) {
        throw new Error('No articles found on Dev.to');
      }
      
      const randomArticle = articles[Math.floor(Math.random() * articles.length)];
      
      if (!randomArticle) {
        throw new Error('Could not find random article');
      }
      
      return {
        id: crypto.randomUUID(),
        url: randomArticle.url,
        title: randomArticle.title,
        description: `Dev.to article by ${randomArticle.user.name}`,
        source: 'Dev.to',
        category: 'tech',
        rating: 0,
        created_at: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch stumble from Dev.to, returning null:', error);
      return null;
    }
  }
}
