/**
 * @fileoverview SQLite-backed explainer draft cache (B2, #217).
 *
 * Implements the `ExplainerDraftCache` port defined in `explainerService.ts`,
 * so `ExplainerService` can persist generated drafts across restarts instead of
 * the in-memory `MemoryDraftCache`. Keyed by `(url, prompt_version)` — bumping
 * `PROMPT_VERSION` turns every old row into a clean miss without a migration.
 */

import type { Database as DatabaseType } from "better-sqlite3";
import type { EnrichmentDraft } from "../services/enrichmentService.js";
import type { ExplainerDraftCache } from "../services/explainerService.js";

export class SqliteExplainerRepo implements ExplainerDraftCache {
  constructor(private readonly db: DatabaseType) {
    // Owns its table so the cache works against any better-sqlite3 handle
    // (the live app DB or an in-memory test DB) — idempotent.
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS explainer_cache (
        url TEXT NOT NULL,
        prompt_version TEXT NOT NULL,
        draft_json TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        PRIMARY KEY (url, prompt_version)
      )
    `);
  }

  get(url: string, version: string): EnrichmentDraft | null {
    const row = this.db
      .prepare(
        "SELECT draft_json FROM explainer_cache WHERE url = ? AND prompt_version = ?",
      )
      .get(url, version) as { draft_json: string } | undefined;
    return row ? (JSON.parse(row.draft_json) as EnrichmentDraft) : null;
  }

  put(url: string, version: string, draft: EnrichmentDraft): void {
    this.db
      .prepare(
        `INSERT INTO explainer_cache (url, prompt_version, draft_json, created_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(url, prompt_version) DO UPDATE SET
           draft_json = excluded.draft_json,
           created_at = excluded.created_at`,
      )
      .run(url, version, JSON.stringify(draft), Date.now());
  }
}
