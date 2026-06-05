import type { ContentFetcher } from './ContentFetcher.js';
import type { StumbleAsset } from '../models/asset.js';
import crypto from 'crypto';
export class RedditSource implements ContentFetcher {
  private readonly CATEGORY_MAP: Record<string, string> = {
    science: 'science', tech: 'technology', art: 'art', random: 'interestingasfuck', all: 'interestingasfuck'
  };
  async fetchStumble(category: string): Promise<StumbleAsset> {
    const subreddit = this.CATEGORY_MAP[category] || 'interestingasfuck';
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=25`, { headers: { 'User-Agent': 'stumble-clone:v1.0.0' } });
    if (!response.ok) throw new Error(`Reddit API error: ${response.statusText}`);
    const data = await response.json();
    const posts = data.data.children.filter((p: any) => !p.data.is_self && !p.data.stickied);
    if (posts.length === 0) throw new Error('No suitable posts');
    const randomPost = posts[Math.floor(Math.random() * posts.length)].data;
    return {
      id: crypto.randomUUID(),
      url: `https://www.reddit.com${randomPost.permalink}`,
      title: randomPost.title,
      description: `Reddit post from r/${subreddit} by ${randomPost.author}`,
      source: `Reddit (r/${subreddit})`,
      category: category === 'all' ? 'random' : category,
      rating: 0,
      created_at: new Date(),
    };
  }
}
