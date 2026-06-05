import { ContentFetcher } from './ContentFetcher.js';
import type { StumbleAsset } from '../models/asset.js';
import crypto from 'crypto';

export class HackerNewsSource implements ContentFetcher {
  private readonly TOP_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/topstories.json';
  private readonly ITEM_URL_BASE = 'https://hacker-news.firebaseio.com/v0/item/';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchStumble(category: string): Promise<StumbleAsset> {
    // HN is always tech category
    const topStoriesRes = await fetch(this.TOP_STORIES_URL);
    if (!topStoriesRes.ok) {
      throw new Error(`HN API error: ${topStoriesRes.statusText}`);
    }

    const storyIds: number[] = await topStoriesRes.json();
    // Use a subset of top stories to ensure we get active content
    const randomId = storyIds[Math.floor(Math.random() * Math.min(storyIds.length, 50))];

    const itemRes = await fetch(`${this.ITEM_URL_BASE}${randomId}.json`);
    if (!itemRes.ok) {
      throw new Error(`HN Item API error: ${itemRes.statusText}`);
    }

    const story = await itemRes.json();

    return {
      id: crypto.randomUUID(),
      url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
      title: story.title,
      description: `Hacker News story by ${story.by}. Score: ${story.score}`,
      source: 'Hacker News',
      category: 'tech',
      rating: 0,
      created_at: new Date(),
    };
  }
}
