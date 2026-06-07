import type { Request, Response } from "express";
import { DiscoveryService } from "../services/discoveryService.js";
import type { IStoragePort } from "../db/storagePort.js";
import { AppError } from "../middleware/errorHandler.js";
import type { AuthenticatedRequest } from "../middleware/auth.js";

export class DiscoveryController {
  constructor(
    private discoveryService: DiscoveryService,
    private storage: IStoragePort,
  ) {}

  getRecommendations = async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const recommendations = await this.discoveryService.getRecommendations(
      userId,
      limit,
    );
    res.json(recommendations || []);
  };

  search = async (req: Request, res: Response) => {
    const query = req.query.q as string;
    if (!query) throw new AppError("Missing query parameter", 400);
    const results = await this.storage.searchAssets(query);
    res.json(results);
  };

  stumble = async (req: AuthenticatedRequest, res: Response) => {
    const category =
      typeof req.query.category === "string" ? req.query.category : "all";
    const historyParam = req.query.history as string | undefined;
    const history = historyParam ? historyParam.split(",") : [];
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const asset = await this.discoveryService.stumble(
      category,
      history,
      userId,
    );
    res.json({ ...asset, blocked: asset?.source === "ProductHunt" });
  };

  updatePreferences = async (req: AuthenticatedRequest, res: Response) => {
    const { type, name, delta } = req.body;
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    await this.storage.updateUserPreference(userId, type, name, delta);
    res.sendStatus(204);
  };

  rate = async (req: AuthenticatedRequest, res: Response) => {
    const { assetId, isPositive } = req.body;
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    await this.discoveryService.rate(assetId, isPositive, userId);
    res.sendStatus(204);
  };

  getHistory = async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const history = await this.discoveryService.getHistory(userId, limit);
    res.json(history || []);
  };

  addFavorite = async (req: AuthenticatedRequest, res: Response) => {
    const { assetId } = req.body;
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    await this.discoveryService.addFavorite(userId, assetId);
    res.sendStatus(201);
  };

  getFavorites = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const favorites = await this.discoveryService.getFavorites(userId);
    res.json(favorites || []);
  };

  removeFavorite = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user_id;
    if (!userId) throw new AppError("Unauthorized", 401);
    const assetId = req.params.id;
    if (typeof assetId !== "string") throw new AppError("Invalid ID", 400);
    await this.discoveryService.removeFavorite(userId, assetId);
    res.sendStatus(204);
  };

  getCategories = async (req: Request, res: Response) => {
    const categories = await this.discoveryService.getCategories();
    res.json(categories);
  };

  seed = async (req: Request, res: Response) => {
    const { seedDefaultAssets, DEFAULT_SEED_ASSETS } =
      await import("../bootstrap.js");
    await seedDefaultAssets(this.storage);
    res.json({
      message: "Seeding complete",
      count: DEFAULT_SEED_ASSETS.length,
    });
  };
}
