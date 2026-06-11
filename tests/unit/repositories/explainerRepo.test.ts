import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { SqliteExplainerRepo } from "../../../app/src/repositories/explainerRepo.js";
import { ExplainerResult } from "../../../app/src/services/explainerService.js";

describe("SqliteExplainerRepo", () => {
  let db: Database.Database;
  let repo: SqliteExplainerRepo;

  beforeEach(() => {
    db = new Database(":memory:");
    repo = new SqliteExplainerRepo(db);
  });

  it("should cache and retrieve draft", async () => {
    const url = "http://test.com";
    const version = "v1";
    const draft: ExplainerResult = {
      summary: "Summary",
      keyPoints: ["Point 1"],
      image: "image.png",
      provenance: "AI",
      sourceUrl: url,
    };

    await repo.put(url, version, draft);
    const retrieved = await repo.get(url, version);
    expect(retrieved).toEqual(draft);
  });

  it("should return null for miss", async () => {
    const retrieved = await repo.get("http://notfound.com", "v1");
    expect(retrieved).toBeNull();
  });

  it("should return null for different prompt version", async () => {
    const url = "http://test.com";
    const draft: ExplainerResult = {
      summary: "Summary",
      keyPoints: ["Point 1"],
      image: "image.png",
      provenance: "AI",
      sourceUrl: url,
    };

    await repo.put(url, "v1", draft);
    const retrieved = await repo.get(url, "v2");
    expect(retrieved).toBeNull();
  });
});
