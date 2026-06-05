# Testing Guide — stumble-clone

Derived from ai-email-copilot testing philosophy. Every new feature must be backed by tests.

## Tool

Vitest is the test runner for both app/ and ui/. Each subproject has its own vitest.config.ts.

Run from the root:
npm test               # All unit tests (fast, no network)
npm run test:coverage  # With coverage (must be >=80%)
npm run test:integration # Integration tests (real DB, real endpoints)

## Coverage gate

- 80% overall coverage is the minimum.
- CI will enforce this.
- Config: vitest.config.ts with coverage thresholds: lines 80, functions 80, branches 80, statements 80.

## Test types

### Unit tests
- Live in tests/unit/ (or co-located *.test.ts).
- Fast, no I/O — mock all external dependencies (databases, network, file system).
- Every public function/module must have unit tests.
- Use Vitest mocks (vi.fn(), vi.mock()) — never hit real services.

Example of a unit test:

import { describe, it, expect, vi } from 'vitest';
import { DiscoveryService } from './discovery-service';
import { StoragePort } from './storage-port';

const mockStorage: StoragePort = {
  getAssets: vi.fn().mockResolvedValue([{ id: '1', url: 'http://example.com' }]),
};

describe('DiscoveryService', () => {
  it('should return assets from storage', async () => {
    const service = new DiscoveryService(mockStorage);
    const assets = await service.discover();
    expect(assets).toHaveLength(1);
    expect(mockStorage.getAssets).toHaveBeenCalledOnce();
  });
});

### Integration tests
- Live in tests/integration/.
- Test the wiring between components — real temporary SQLite database, real HTTP server (using supertest or similar).
- Mark them with a custom Vitest tag or use a separate config that includes only the integration test files.
- Self-skip if required infrastructure is not available (e.g., database file cannot be created) and log a clear message.

Example of an integration test outline:

describe('POST /api/v1/assets', () => {
  it('should store and retrieve an asset', async () => {
    // Start server with temporary DB
    // Send request
    // Assert response and database state
  });
});

### End-to-end tests (future)
- For the browser extension and UI, we may add Playwright or Cypress later.

## Fixtures

Store reusable test data in tests/fixtures/:
- sample_assets.json
- sample_extension_message.json

Load them via import or readFileSync in your test setup.

## Mocking external APIs

Mock the HTTP client (fetch/axios) at the network boundary, not the module under test.

## Test naming

- describe('module/function', () => { it('should do X given Y', ...) })
- Integration tests: describe('POST /api/v1/assets', ...)

## Before you push

Run:
npm test
npm run test:integration   # optional but recommended
Ensure lint passes and coverage >=80%. CI will fail otherwise.

---

Golden rule: if it’s not tested, it’s broken.
