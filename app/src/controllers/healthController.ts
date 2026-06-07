import type { Request, Response } from 'express';

export const healthCheck = (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
};