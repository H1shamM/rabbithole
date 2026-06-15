import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SqliteAdapter } from "../../../app/src/db/sqliteAdapter";
import { DiscoveryService } from "../../../app/src/services/discoveryService";
import { ReportController } from "../../../app/src/controllers/reportController";
import type { StumbleAsset } from "../../../app/src/models/asset";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../../../app/src/middleware/auth";

function asset(id: string, url: string): StumbleAsset {
  return {
    id,
    url,
    title: `Title ${id}`,
    description: "d",
    source: "Test",
    category: "tech",
    rating: 0,
    created_at: new Date(),
  };
}

describe("report + block (#337)", () => {
  let adapter: SqliteAdapter;

  beforeEach(async () => {
    adapter = new SqliteAdapter(":memory:");
    await adapter.saveAsset(asset("a1", "https://one.com"));
    await adapter.saveAsset(asset("a2", "https://two.com"));
  });

  afterEach(() => adapter.db.close());

  it("records reports and blocks a url (idempotently)", async () => {
    await adapter.saveReport("u1", "a2", "https://two.com", "spam");
    await adapter.blockUrl("u1", "https://two.com");
    await adapter.blockUrl("u1", "https://two.com"); // idempotent
    expect(await adapter.getBlockedUrls("u1")).toEqual(["https://two.com"]);
    expect(await adapter.getBlockedUrls("other")).toEqual([]);
  });

  it("never serves a user their blocked url", async () => {
    await adapter.blockUrl("u1", "https://two.com");
    const svc = new DiscoveryService(adapter, []);
    for (let i = 0; i < 8; i++) {
      const got = await svc.stumble("all", [], "u1");
      expect(got.url).not.toBe("https://two.com");
    }
  });

  it("controller resolves the url from assetId, records + blocks", async () => {
    const controller = new ReportController(adapter);
    const sendStatus = vi.fn();
    await controller.report(
      {
        user_id: "u1",
        body: { assetId: "a2", reason: "nsfw" },
      } as unknown as AuthenticatedRequest,
      { sendStatus } as unknown as Response,
    );
    expect(sendStatus).toHaveBeenCalledWith(201);
    expect(await adapter.getBlockedUrls("u1")).toContain("https://two.com");
  });
});
