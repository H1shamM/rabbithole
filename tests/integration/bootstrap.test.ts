import { describe, it, expect, afterEach } from "vitest";
import { SqliteAdapter } from "../../app/src/db/sqliteAdapter";
import {
  seedDefaultAssets,
  DEFAULT_SEED_ASSETS,
} from "../../app/src/bootstrap";

// Hermetic: a fresh in-memory DB per test, closed afterward — no shared file.
let storage: SqliteAdapter;

afterEach(() => {
  storage?.db.close();
});

describe("bootstrap data seeding", () => {
  it("seeds default assets when called against an empty database", async () => {
    storage = new SqliteAdapter(":memory:");
    await seedDefaultAssets(storage);

    const categories = await storage.getAllCategories();
    expect(categories).toEqual(
      expect.arrayContaining(
        DEFAULT_SEED_ASSETS.map((asset) => asset.category),
      ),
    );

    const seededAsset = await storage.getAssetById(DEFAULT_SEED_ASSETS[0].id);
    expect(seededAsset).not.toBeNull();
    expect(seededAsset?.title).toBe(DEFAULT_SEED_ASSETS[0].title);
  });

  it("is idempotent when seeding the same data multiple times", async () => {
    storage = new SqliteAdapter(":memory:");
    await seedDefaultAssets(storage);
    await seedDefaultAssets(storage);

    const categories = await storage.getAllCategories();
    expect(categories).toHaveLength(
      new Set(DEFAULT_SEED_ASSETS.map((asset) => asset.category)).size,
    );

    const seededAsset = await storage.getAssetById(DEFAULT_SEED_ASSETS[1].id);
    expect(seededAsset).not.toBeNull();
    expect(seededAsset?.source).toBe(DEFAULT_SEED_ASSETS[1].source);
  });
});
