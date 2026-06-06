import { Router } from 'express';
import { DiscoveryService } from '../../services/discovery_service.js';
import type { IStoragePort } from '../../db/storage_port.js';

export function createDiscoveryRouter(discoveryService: DiscoveryService, storage: IStoragePort): Router {
  const _storage = storage;
  const router = Router();

  router.get('/recommendations', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = (req as any).user_id;
      const recommendations = await discoveryService.get_recommendations(userId, limit);
      res.json(recommendations);
    } catch (error: unknown) {
      console.error('Error in /recommendations:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/stumble', async (req, res) => {
    try {
      const category = (req.query.category as string) || 'all';
      const history = (req.query.history as string)?.split(',') || [];
      const userId = (req as any).user_id;
      
      const asset = await discoveryService.stumble(category, history, userId);
      
      res.json({ ...asset, blocked: asset.source === 'ProductHunt' });
    } catch (error: unknown) {
      res.status(404).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/preferences', async (req, res) => {
    try {
      const { type, name, delta } = req.body;
      await (discoveryService as any).storage_port.update_preference(type, name, delta);
      res.sendStatus(204);
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/rate', async (req, res) => {
    try {
      const { assetId, isPositive } = req.body;
      const userId = (req as any).user_id;
      await discoveryService.rate(assetId, isPositive, userId);
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
      console.error('Error in /history:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.post('/favorites', async (req, res) => {
    try {
      const { assetId } = req.body;
      await discoveryService.addFavorite(assetId);
      res.sendStatus(201);
    } catch (error: unknown) {
      console.error('Error in POST /favorites:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  router.get('/favorites', async (req, res) => {
    try {
      const favorites = await discoveryService.getFavorites();
      res.json(favorites);
    } catch (error: unknown) {
      console.error('Error in GET /favorites:', error);
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

  router.post('/seed', async (req, res) => {
    try {
      const mock_data = [
        { id: 't1', url: 'https://news.ycombinator.com', title: 'Hacker News', category: 'tech', source: 'HN', description: 'Tech' },
        { id: 'a1', url: 'https://www.thisiscolossal.com', title: 'Colossal', category: 'art', source: 'Colossal', description: 'Art' },
      ];
      for (const item of mock_data) {
        await _storage.save_asset({ ...item, rating: 0, created_at: new Date() });
      }
      res.json({ message: 'Seeding complete', count: mock_data.length });
    } catch (error: unknown) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  return router;
}
