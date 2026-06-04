import express from 'express';
import { SqliteAdapter } from '../adapters/SqliteAdapter';
import { DiscoveryService } from '../domain/DiscoveryService';
import { StumbleAsset } from '../domain/StumbleAsset';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Dependencies (Hexagonal)
const storage = new SqliteAdapter('stumble.db');
const discoveryService = new DiscoveryService(storage);

// Seed initial data if empty
async function seedData() {
  const interests = await discoveryService.getInterests();
  if (interests.length === 0) {
    console.log('Seeding initial data...');
    const initialAssets: StumbleAsset[] = [
      {
        id: '1',
        url: 'https://www.google.com/sky/',
        title: 'Google Sky',
        interest: 'Space',
        rating: 0,
        createdAt: new Date()
      },
      {
        id: '2',
        url: 'https://neave.com/strobe/',
        title: 'Strobe Illusion',
        interest: 'Art',
        rating: 0,
        createdAt: new Date()
      },
      {
        id: '3',
        url: 'https://www.window-swap.com/',
        title: 'WindowSwap',
        interest: 'Travel',
        rating: 0,
        createdAt: new Date()
      }
    ];

    for (const asset of initialAssets) {
      await storage.saveAsset(asset);
    }
  }
}

seedData();

// API Routes
app.get('/api/v1/stumble', async (req, res) => {
  try {
    const interests = (req.query.interests as string)?.split(',') || ['Space', 'Art', 'Travel'];
    const history = (req.query.history as string)?.split(',') || [];
    
    const asset = await discoveryService.stumble(interests, history);
    res.json(asset);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.post('/api/v1/rate', async (req, res) => {
  try {
    const { assetId, isPositive } = req.body;
    await discoveryService.rate(assetId, isPositive);
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/interests', async (req, res) => {
  const interests = await discoveryService.getInterests();
  res.json(interests);
});

app.listen(port, () => {
  console.log(`StumbleApp backend listening at http://localhost:${port}`);
});
