import { Router } from 'express';
import { DiscoveryService } from '../../services/discovery_service.js';
import type { IStoragePort } from '../../db/storage_port.js';

export function createDiscoveryRouter(discoveryService: DiscoveryService, storage: IStoragePort): Router {
  const router = Router();

  router.get('/stumble', async (req, res) => {
    try {
      const category = (req.query.category as string) || 'all';
      const history = (req.query.history as string)?.split(',') || [];
      
      const asset = await discoveryService.stumble(category, history);
      res.json(asset);
    } catch (error: unknown) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/rate', async (req, res) => {
    try {
      const { assetId, isPositive } = req.body;
      await discoveryService.rate(assetId, isPositive);
      res.sendStatus(204);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/history', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const history = await discoveryService.get_history(limit);
      res.json(history);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/favorites', async (req, res) => {
    try {
      const { assetId } = req.body;
      await discoveryService.addFavorite(assetId);
      res.sendStatus(201);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/favorites', async (req, res) => {
    try {
      const favorites = await discoveryService.getFavorites();
      res.json(favorites);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.delete('/favorites/:assetId', async (req, res) => {
    try {
      await discoveryService.removeFavorite(req.params.assetId);
      res.sendStatus(204);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/categories', async (req, res) => {
    try {
      const categories = await discoveryService.get_categories();
      res.json(categories);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return router;
}
