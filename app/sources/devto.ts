import { ContentFetcher } from './ContentFetcher.js';
import type { StumbleAsset } from '../models/asset.js';
import crypto from 'crypto';
export class DevToSource implements ContentFetcher {
  private readonly API_URL = 'https://dev.to/api/articles?top=7';
  async fetchStumble(category: string): Promise<StumbleAsset> {
    const response = await fetch(this.API_URL);
    if (!response.ok) throw new Error(`Dev.to API error: ${response.statusText}`);
    const articles = await response.json();
    if (articles.length === 0) throw new Error('No articles found on Dev.to');
    const randomArticle = articles[Math.floor(Math.random() * articles.length)];
    return {
      id: crypto.randomUUID(),
      url: randomArticle.url,
      title: randomArticle.title,
      description: `Dev.to article by ${randomArticle.user.name}`,
      source: 'Dev.to',
      category: category === 'all' ? 'tech' : category,
      rating: 0,
      created_at: new Date(),
    };
  }
}
