import type { Response } from "express";
import type { IStoragePort } from "../db/storagePort.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

interface ReportBody {
  assetId?: string;
  url?: string;
  reason?: string;
}

/**
 * Report + block (#337). A user reports the current asset; we record the report
 * and block that URL for that user so it's never served back to them. Reports
 * accumulate for later moderation review.
 */
export class ReportController {
  constructor(private storage: IStoragePort) {}

  report = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const { assetId, url, reason } = req.body as ReportBody;

    // Resolve the URL from the asset id when provided; fall back to a raw url.
    let targetUrl = url;
    if (assetId) {
      const asset = await this.storage.getAssetById(assetId);
      if (asset) targetUrl = asset.url;
    }
    if (!targetUrl) throw new AppError("Missing asset id or url", 400);

    await this.storage.saveReport(userId, assetId ?? null, targetUrl, reason);
    await this.storage.blockUrl(userId, targetUrl);
    res.sendStatus(201);
  };
}
