/**
 * @fileoverview GitHub Trending content fetcher.
 * Scrapes GitHub's trending page for popular repositories.
 */

import crypto from 'crypto';
import type { ContentFetcher } from './ContentFetcher.js';
import type { StumbleAsset } from '../models/asset.js';
import { fetchWithTimeout } from './utils.js';

export class GitHubTrendingSource implements ContentFetcher {
  private readonly TRENDING_URL = 'https://github.com/trending';

  async fetchStumble(category: string): Promise<StumbleAsset | null> {
    try {
      const response = await fetchWithTimeout(this.TRENDING_URL, {}, 8000);
      if (!response.ok) throw new Error(`GitHub Trending returned ${response.status}`);
      
      const html = await response.text();
      
      // Parse trending repositories
      const repoRegex = /<h2 class="h3 lh-condensed">\s*<a href="\/([^"]+)"/g;
      const descRegex = /<p class="col-9 color-fg-muted my-1 pr-4">([^<]+)<\/p>/g;
      
      const urls: string[] = [];
      let match;
      while ((match = repoRegex.exec(html)) !== null && urls.length < 20) {
        if (match[1]) urls.push(`https://github.com/${match[1]}`);
      }
      
      const descriptions: string[] = [];
      while ((match = descRegex.exec(html)) !== null && descriptions.length < urls.length) {
        if (match[1]) descriptions.push(match[1].trim());
      }
      
      if (urls.length === 0) throw new Error('No repos found');
      
      const randomIndex = Math.floor(Math.random() * urls.length);
      const repoUrl = urls[randomIndex];
      
      if (!repoUrl) return null;

      const repoPath = repoUrl.replace('https://github.com/', '');
      const titleParts = repoPath.split('/');
      const title = titleParts[1] || titleParts[0];
      const description = descriptions[randomIndex] || 'Trending GitHub repository';
      
      return {
        id: crypto.randomUUID(),
        url: repoUrl,
        title: `${title} – Trending on GitHub`,
        description,
        source: 'GitHub Trending',
        category: category === 'all' ? 'tech' : category,
        rating: 0,
        created_at: new Date(),
      };
    } catch (error) {
      console.error('Failed to fetch from GitHub Trending:', error);
      return null;
    }
  }
}
