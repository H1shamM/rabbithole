import express from 'express';
import cors from 'cors';
import { settings } from './config/settings.js';
import { SqliteAdapter } from './db/sqlite_adapter.js';
import { DiscoveryService } from './services/discovery_service.js';
import { createDiscoveryRouter } from './api/v1/discovery_routes.js';

// Sources
import { WikipediaSource } from './sources/wikipedia.js';
import { HackerNewsSource } from './sources/hn.js';
import { RedditSource } from './sources/reddit.js';
import { DevToSource } from './sources/devto.js';

const app = express();

app.use(cors());
app.use(express.json());

// 1. Dependency Injection
const storage = new SqliteAdapter(settings.DB_PATH);
const sources = [
  new WikipediaSource(),
  new HackerNewsSource(),
  new RedditSource(),
  new DevToSource()
];
const discoveryService = new DiscoveryService(storage, sources);

// 2. Routing Setup
app.use('/api/v1', createDiscoveryRouter(discoveryService, storage));

// 3. Health Check
app.get('/health', (_req, res) => res.json({ status: 'healthy', env: settings.ENV }));

// 4. Bootstrap
async function bootstrap() {
  const categories = await discoveryService.get_categories();
  if (categories.length === 0) {
    console.log('--- Bootstrap Seeding ---');
    // ... basic seeding
  }
}
bootstrap();

app.listen(settings.PORT, () => {
  console.log(`[StumbleApp] running on port ${settings.PORT}`);
});
