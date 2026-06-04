import Database from 'better-sqlite3';
import { IStoragePort } from '../ports/IStoragePort';
import { StumbleAsset } from '../domain/StumbleAsset';

export class SqliteAdapter implements IStoragePort {
  private db: Database.Database;

  constructor(dbPath: string = ':memory:') {
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
        createdAt TEXT NOT NULL,
        lastVisitedAt TEXT
      )
    `);
  }

  async getAssetById(id: string): Promise<StumbleAsset | null> {
    const row = this.db.prepare('SELECT * FROM assets WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapRowToAsset(row);
  }

  async getRandomAssetByInterests(interests: string[], excludeIds: string[]): Promise<StumbleAsset | null> {
    const placeholders = interests.map(() => '?').join(',');
    const excludePlaceholders = excludeIds.length > 0 ? `AND id NOT IN (${excludeIds.map(() => '?').join(',')})` : '';
    
    const query = `
      SELECT * FROM assets 
      WHERE interest IN (${placeholders}) 
      ${excludePlaceholders}
      ORDER BY RANDOM() 
      LIMIT 1
    `;

    const params = [...interests, ...excludeIds];
    const row = this.db.prepare(query).get(...params) as any;
    
    if (!row) return null;
    return this.mapRowToAsset(row);
  }

  async saveAsset(asset: StumbleAsset): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO assets (id, url, title, interest, rating, createdAt, lastVisitedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      asset.id,
      asset.url,
      asset.title,
      asset.interest,
      asset.rating,
      asset.createdAt.toISOString(),
      asset.lastVisitedAt?.toISOString() || null
    );
  }

  async updateRating(id: string, delta: number): Promise<void> {
    this.db.prepare('UPDATE assets SET rating = rating + ? WHERE id = ?').run(delta, id);
  }

  async getAllInterests(): Promise<string[]> {
    const rows = this.db.prepare('SELECT DISTINCT interest FROM assets').all() as { interest: string }[];
    return rows.map(r => r.interest);
  }

  private mapRowToAsset(row: any): StumbleAsset {
    return {
      id: row.id,
      url: row.url,
      title: row.title,
      interest: row.interest,
      rating: row.rating,
      createdAt: new Date(row.createdAt),
      lastVisitedAt: row.lastVisitedAt ? new Date(row.lastVisitedAt) : undefined
    };
  }
}
