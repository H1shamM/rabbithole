import express from 'express';
import cors from 'cors';
import { settings } from './config/settings';
import { SqliteAdapter } from './db/sqlite_adapter';
import { DiscoveryService } from './services/discovery_service';
import { createDiscoveryRouter } from './api/v1/discovery_routes';

const app = express();

app.use(cors());
app.use(express.json());

// 1. Dependency Injection (Professional Pattern)
const storage = new SqliteAdapter(settings.DB_PATH);
const discoveryService = new DiscoveryService(storage);

// 2. Routing Setup
app.use('/api/v1', createDiscoveryRouter(discoveryService));

// 3. Health Check (Infrastructure Requirement)
app.get('/health', (req, res) => res.json({ status: 'healthy', env: settings.ENV }));

// 4. Seeding Logic (Moved from prototype style to internal util)
async function seed_database() {
  const interests = await discoveryService.get_interests();
  if (interests.length === 0) {
    console.log('--- Professional Seeding Initiated ---');
    const initial_assets = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        url: 'https://www.google.com/sky/',
        title: 'Google Sky',
        interest: 'Space',
        rating: 0,
        created_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        url: 'https://neave.com/strobe/',
        title: 'Strobe Illusion',
        interest: 'Art',
        rating: 0,
        created_at: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        url: 'https://www.window-swap.com/',
        title: 'WindowSwap',
        interest: 'Travel',
        rating: 0,
        created_at: new Date()
      }
    ];

    for (const asset of initial_assets) {
      await storage.save_asset(asset);
    }
    console.log('--- Seeding Complete ---');
  }
}

seed_database();

app.listen(settings.PORT, () => {
  console.log(`[StumbleApp] Professional Discovery Engine running on port ${settings.PORT}`);
});
