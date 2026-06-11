import type { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import type { IStoragePort } from "../db/storagePort.js";

export class ExplainerFeedbackController {
  constructor(private storage: IStoragePort) {}

  rate = async (req: Request, res: Response) => {
    const { explainerId, isPositive } = req.body;
    const userId = (req.user as { id: string })?.id;
    if (!explainerId || typeof isPositive !== "boolean") {
      return res.status(400).json({ error: "Invalid request", statusCode: 400 });
    }

    logger.info({ userId, explainerId, isPositive }, "Explainer feedback");
    
    // TODO: persist feedback to storage (like asset rating)
    res.status(204).send();
  };
}
