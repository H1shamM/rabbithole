import { Database } from "better-sqlite3";
import { ExplainerResult } from "../services/explainerService.js";

export interface ExplainerRepo {
  get(url: string, version: string): Promise<ExplainerResult | null>;
  put(url: string, version: string, draft: ExplainerResult): Promise<void>;
}

export class SqliteExplainerRepo implements ExplainerRepo {
  constructor(private db: Database) {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS explainer_cache (
        url TEXT,
        prompt_version TEXT,
        draft_json TEXT,
        created_at INTEGER,
        PRIMARY KEY(url, prompt_version)
      )
    `);
  }

  async get(url: string, version: string): Promise<ExplainerResult | null> {
    const row = this.db
      .prepare(
        "SELECT draft_json FROM explainer_cache WHERE url = ? AND prompt_version = ?",
      )
      .get(url, version) as { draft_json: string } | undefined;
    return row ? JSON.parse(row.draft_json) : null;
  }

  async put(url: string, version: string, draft: ExplainerResult): Promise<void> {
    this.db
      .prepare(
        "INSERT OR REPLACE INTO explainer_cache (url, prompt_version, draft_json, created_at) VALUES (?, ?, ?, ?)",
      )
      .run(url, version, JSON.stringify(draft), Date.now());
  }
}
