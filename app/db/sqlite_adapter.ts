import Database from 'better-sqlite3';
import { IStoragePort } from './storage_port';
import { StumbleAsset } from '../models/asset';

export class SqliteAdapter implements IStoragePort {
  private db: Database.Database;

  constructor(dbPath: string = 'stumble.db') {
    this.db = new Database(dbPath);
    this.init();
  }

  private init(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        interest TEXT NOT NULL,
        rating INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        last_visited_at TEXT
      )
    `);
  }

  async get_asset_by_id(id: string): Promise<StumbleAsset | null> {
    const row = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.map_row_to_asset(row);
  }

  async get_random_asset_by_interests(interests: string[], exclude_ids: string[]): Promise<StumbleAsset | null> {
    const placeholders = interests.map(() => '?').join(',');
    const excludePlaceholders = exclude_ids.length > 0 ? `AND id NOT IN (${exclude_ids.map(() => '?').join(',')})` : '';
    
    const query = `
      SELECT * FROM assets 
      WHERE interest IN (${placeholders}) 
      ${excludePlaceholders}
      ORDER BY RANDOM() 
      LIMIT 1
    `;

    const params = [...interests, ...exclude_ids];
    const row = this.db.prepare(query).get(...params) as any;
    
    if (!row) return null;
    return this.map_row_to_asset(row);
  }

  async save_asset(asset: StumbleAsset): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO assets (id, url, title, interest, rating, created_at, last_visited_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      asset.id,
      asset.url,
      asset.title,
      asset.interest,
      asset.rating,
      asset.created_at.toISOString(),
      asset.last_visited_at?.toISOString() || null
    );
  }

  async update_rating(id: string, delta: number): Promise<void> {
    this.db.prepare('UPDATE assets SET rating = rating + ? WHERE id = ?').run(delta, id);
  }

  async get_all_interests(): Promise<string[] | any> {
    const rows = this.db.prepare('SELECT DISTINCT interest FROM assets').all() as { interest: string }[];
    return rows.map(r => r.interest);
  }

  private map_row_to_asset(row: any): StumbleAsset {
    return {
      id: row.id,
      url: row.url,
      title: row.title,
      interest: row.interest,
      rating: row.rating,
      created_at: new Date(row.created_at),
      last_visited_at: row.last_visited_at ? new Date(row.last_visited_at) : undefined
    };
  }
}
