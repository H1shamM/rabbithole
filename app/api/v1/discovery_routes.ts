import { Router } from 'express';
import { DiscoveryService } from '../../services/discovery_service';

export function createDiscoveryRouter(discoveryService: DiscoveryService): Router {
  const router = Router();

  router.get('/stumble', async (req, res) => {
    try {
      const interests = (req.query.interests as string)?.split(',') || [];
      const history = (req.query.history as string)?.split(',') || [];
      
      const asset = await discoveryService.stumble(interests, history);
      res.json(asset);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  router.post('/rate', async (req, res) => {
    try {
      const { assetId, isPositive } = req.body;
      await discoveryService.rate(assetId, isPositive);
      res.sendStatus(204);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/interests', async (req, res) => {
    const interests = await discoveryService.get_interests();
    res.json(interests);
  });

  return router;
}
