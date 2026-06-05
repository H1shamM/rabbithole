import Database from 'better-sqlite3';
import type { IStoragePort, RatedItem } from './storage_port.js';
import type { StumbleAsset } from '../models/asset.js';
import crypto from 'crypto';

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
        description TEXT,
        source TEXT NOT NULL,
        category TEXT NOT NULL,
        rating INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        last_visited_at TEXT
      );
      CREATE TABLE IF NOT EXISTS ratings (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL,
        rating TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(asset_id) REFERENCES assets(id)
      );
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        asset_id TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(asset_id) REFERENCES assets(id)
      )
    `);
  }

  async get_asset_by_id(id: string): Promise<StumbleAsset | null> {
    const row = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.map_row_to_asset(row);
  }

  async get_random_asset_by_category(category: string, exclude_ids: string[]): Promise<StumbleAsset | null> {
    let query = 'SELECT * FROM assets WHERE 1=1 ';
    const params: any[] = [];

    if (category !== 'all') {
      query += 'AND category = ? ';
      params.push(category);
    }

    if (exclude_ids.length > 0) {
      query += `AND id NOT IN (${exclude_ids.map(() => '?').join(',')}) `;
      params.push(...exclude_ids);
    }

    query += 'ORDER BY RANDOM() LIMIT 1';

    const row = this.db.prepare(query).get(...params) as any;
    
    if (!row) return null;
    return this.map_row_to_asset(row);
  }

  async save_asset(asset: StumbleAsset): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO assets (id, url, title, description, source, category, rating, created_at, last_visited_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      asset.id,
      asset.url,
      asset.title,
      asset.description || null,
      asset.source,
      asset.category,
      asset.rating,
      asset.created_at.toISOString(),
      asset.last_visited_at?.toISOString() || null
    );
  }

  async update_rating(id: string, delta: number): Promise<void> {
    this.db.prepare('UPDATE assets SET rating = rating + ? WHERE id = ?').run(delta, id);
  }

  async get_all_categories(): Promise<string[]> {
    const rows = this.db.prepare('SELECT DISTINCT category FROM assets').all() as { category: string }[];
    return rows.map(r => r.category);
  }

  async save_rating(asset_id: string, rating: 'like' | 'dislike'): Promise<void> {
    this.db.prepare(`
      INSERT INTO ratings (id, asset_id, rating, created_at)
      VALUES (?, ?, ?, ?)
    `).run(crypto.randomUUID(), asset_id, rating, new Date().toISOString());
  }

  async get_history(limit: number): Promise<RatedItem[]> {
    const rows = this.db.prepare(`
      SELECT a.*, r.rating as rating_val, r.created_at as timestamp 
      FROM ratings r
      JOIN assets a ON r.asset_id = a.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `).all(limit) as any[];

    return rows.map(r => ({
      ...this.map_row_to_asset(r),
      rating_val: r.rating_val,
      timestamp: new Date(r.timestamp)
    }));
  }

  async save_favorite(asset_id: string): Promise<void> {
    this.db.prepare(`
      INSERT INTO favorites (id, asset_id, created_at)
      VALUES (?, ?, ?)
    `).run(crypto.randomUUID(), asset_id, new Date().toISOString());
  }

  async remove_favorite(asset_id: string): Promise<void> {
    this.db.prepare('DELETE FROM favorites WHERE asset_id = ?').run(asset_id);
  }

  async get_favorites(): Promise<StumbleAsset[]> {
    const rows = this.db.prepare(`
      SELECT a.* 
      FROM favorites f
      JOIN assets a ON f.asset_id = a.id
    `).all() as any[];

    return rows.map(r => this.map_row_to_asset(r));
  }

  private map_row_to_asset(row: any): StumbleAsset {
    return {
      id: row.id,
      url: row.url,
      title: row.title,
      description: row.description || undefined,
      source: row.source,
      category: row.category,
      rating: row.rating,
      created_at: new Date(row.created_at),
      last_visited_at: row.last_visited_at ? new Date(row.last_visited_at) : undefined
    };
  }
}
