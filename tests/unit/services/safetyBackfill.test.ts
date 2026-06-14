import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SqliteAdapter } from "../../../app/src/db/sqliteAdapter";
import {
  backfillSafety,
  type SafetyClassifier,
} from "../../../app/src/services/safetyService";
import type { StumbleAsset } from "../../../app/src/models/asset";

function asset(id: string, url: string): StumbleAsset {
  return {
    id,
    url,
    title: `Title ${id}`,
    description: "desc",
    source: "Test",
    category: "tech",
    rating: 0,
    created_at: new Date(),
  };
}

// Stub: flag anything whose URL contains "bad", pass everything else.
const stubClassifier: SafetyClassifier = {
  async classify(a) {
    return a.url.includes("bad")
      ? { status: "flag", category: "spam", reason: "stub flag" }
      : { status: "pass" };
  },
};

describe("backfillSafety (#336)", () => {
  let adapter: SqliteAdapter;

  beforeEach(async () => {
    adapter = new SqliteAdapter(":memory:");
    await adapter.saveAsset(asset("a1", "https://good.com/1"));
    await adapter.saveAsset(asset("a2", "https://bad.com/x"));
    await adapter.saveAsset(asset("a3", "https://good.com/3"));
  });

  afterEach(() => adapter.db.close());

  it("classifies every asset and tallies the verdicts", async () => {
    const tally = await backfillSafety(adapter, stubClassifier);
    expect(tally).toEqual({ pass: 2, flag: 1, pending: 0 });
  });

  it("flagged assets drop out of the serve pool; passed ones remain", async () => {
    await backfillSafety(adapter, stubClassifier);
    const served = (await adapter.getAllAssets("all")).map((a) => a.id);
    expect(served).toContain("a1");
    expect(served).toContain("a3");
    expect(served).not.toContain("a2");
  });

  it("writes a real verdict on the flagged asset", async () => {
    await backfillSafety(adapter, stubClassifier);
    const a2 = await adapter.getAssetById("a2");
    expect(a2?.safetyStatus).toBe("flag");
  });
});
