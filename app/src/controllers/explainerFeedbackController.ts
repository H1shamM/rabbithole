import type { Response } from "express";
import { logger } from "../utils/logger.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import type { IStoragePort } from "../db/storagePort.js";
import type { DiscoveryService } from "../services/discoveryService.js";

export class ExplainerFeedbackController {
  constructor(
    private storage: IStoragePort,
    private discoveryService: DiscoveryService,
  ) {}

  rate = async (req: AuthenticatedRequest, res: Response) => {
    const { url, isPositive } = req.body as { url: string; isPositive: boolean };
    const userId = req.user_id;

    if (!url || typeof isPositive !== "boolean") {
      throw new AppError("Invalid request", 400);
    }
    if (!userId) throw new AppError("Unauthorized", 401);

    // 1. Log the feedback
    logger.info({ userId, url, isPositive }, "Explainer feedback");

    // 2. Find the asset to reuse discoveryService.rate
    const assets = await this.storage.searchAssets(url);
    const asset = assets.find((a) => a.url === url);

    if (asset) {
      await this.discoveryService.rate(asset.id, isPositive, userId);
    }

    res.sendStatus(204);
  };
}
