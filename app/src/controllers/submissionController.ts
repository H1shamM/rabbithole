import type { Request, Response } from 'express';
import crypto from 'crypto';
import type { IStoragePort } from '../db/storagePort.js';
import { AppError } from '../middleware/errorHandler.js';

export class SubmissionController {
  constructor(private storage: IStoragePort) {}

  createSubmission = async (req: Request, res: Response) => {
    const { url, title } = req.body;
    const userId = (req as any).user_id;
    if (!userId) throw new AppError('Unauthorized', 401);
    await this.storage.saveSubmission({
      id: crypto.randomUUID(),
      user_id: userId,
      url,
      title,
      status: 'pending',
      created_at: new Date(),
    });
    res.sendStatus(201);
  };

  getAllSubmissions = async (req: Request, res: Response) => {
    // TODO: Admin check
    const submissions = await this.storage.getAllSubmissions();
    res.json(submissions);
  };
}