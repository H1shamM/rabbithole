import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SqliteAdapter } from "../../../app/src/db/sqliteAdapter";
import type { StumbleAsset } from "../../../app/src/models/asset";

// #333 — only safety_status='pass' assets are served; pending/flag are excluded
// from every discovery surface (fail-closed). Hermetic in-memory DB.
function asset(id: string, over: Partial<StumbleAsset> = {}): StumbleAsset {
  return {
    id,
    url: `https://example.com/${id}`,
    title: `Title ${id}`,
    description: "desc",
    source: "Test",
    category: "tech",
    rating: 0,
    created_at: new Date(),
    ...over,
  };
}

describe("SqliteAdapter — content-safety serve filter (#333)", () => {
  let adapter: SqliteAdapter;

  beforeEach(async () => {
    adapter = new SqliteAdapter(":memory:");
    await adapter.saveAsset(asset("a1")); // stays pass (column default)
    await adapter.saveAsset(asset("a2"));
    await adapter.saveAsset(asset("a3"));
    await adapter.setAssetSafety("a2", "flag", "nsfw");
    await adapter.setAssetSafety("a3", "pending");
  });

  afterEach(() => {
    adapter.db.close();
  });

  it("saveAsset defaults new rows to 'pass' (non-breaking)", async () => {
    const a1 = await adapter.getAssetById("a1");
    expect(a1?.safetyStatus).toBe("pass");
  });

  it("getAllAssets serves only pass", async () => {
    const ids = (await adapter.getAllAssets("all")).map((a) => a.id);
    expect(ids).toContain("a1");
    expect(ids).not.toContain("a2");
    expect(ids).not.toContain("a3");
  });

  it("searchAssets serves only pass", async () => {
    const ids = (await adapter.searchAssets("Title")).map((a) => a.id);
    expect(ids).toEqual(["a1"]);
  });

  it("getRandomAssetByInterests serves only pass", async () => {
    for (let i = 0; i < 5; i++) {
      const got = await adapter.getRandomAssetByInterests(["tech"], []);
      expect(got?.id).toBe("a1");
    }
  });

  it("getRecommendations serves only pass", async () => {
    const ids = (await adapter.getRecommendations("user1", 10)).map(
      (a) => a.id,
    );
    expect(ids).toContain("a1");
    expect(ids).not.toContain("a2");
    expect(ids).not.toContain("a3");
  });

  it("getAssetsNeedingSafety returns pending/unclassified, not pass/flag", async () => {
    const ids = (await adapter.getAssetsNeedingSafety(10)).map((a) => a.id);
    expect(ids).toContain("a3");
    expect(ids).not.toContain("a1");
    expect(ids).not.toContain("a2");
  });

  it("setAssetSafety can promote an asset back into the pool", async () => {
    await adapter.setAssetSafety("a3", "pass");
    const ids = (await adapter.getAllAssets("all")).map((a) => a.id);
    expect(ids).toContain("a3");
  });
});
