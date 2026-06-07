/**
 * @fileoverview Submission router for URL submissions and moderation.
 */

import { Router } from "express";
import type { Response } from "express";
import crypto from "crypto";
import type { IStoragePort } from "../../db/storagePort.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";

/**
 * Creates the submission router.
 * @param {IStoragePort} storage - The storage adapter instance.
 * @returns {Router} The configured submission router.
 */
export function createSubmissionRouter(storage: IStoragePort): Router {
  const router = Router();

  router.post("/", async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { url, title } = req.body;
      const userId = req.user_id;
      if (!userId) return res.status(401).json({ error: "Unauthorized" });

      await storage.saveSubmission({
        id: crypto.randomUUID(),
        user_id: userId,
        url,
        title,
        status: "pending",
        created_at: new Date(),
      });
      res.sendStatus(201);
    } catch (error: unknown) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  router.get("/", async (req: AuthenticatedRequest, res: Response) => {
    try {
      // TODO: Admin-only check
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error: unknown) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
