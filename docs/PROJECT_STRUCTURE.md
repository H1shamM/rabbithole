# Project Structure — stumble-clone

We follow a modular monorepo approach with three distinct packages.

stumble-clone/
├── app/ # Backend API (Node + TypeScript + Express 5)
│ └── src/
│ ├── main.ts # Entry point
│ ├── app.ts # App wiring (DI, routes, source registration)
│ ├── config/settings.ts
│ ├── db/ # Database abstraction (hexagonal port/adapter)
│ │ ├── storagePort.ts # Interface for storage operations
│ │ └── sqliteAdapter.ts # better-sqlite3 implementation
│ ├── models/asset.ts # Domain models (Zod schemas)
│ ├── services/ # Business logic (discoveryService, readerService, assetGate…)
│ ├── sources/ # ContentFetcher implementations (one per source)
│ ├── controllers/ # Route handlers
│ └── api/v1/ # Route definitions
├── extension/ # Browser extension (JavaScript)
│ ├── background.js
│ └── manifest.json
├── ui/ # React 19 frontend (Vite + TypeScript + Tailwind v4)
│ └── src/
│ ├── components/ # UI components (PascalCase)
│ ├── hooks/ # Hooks (useStumble, useReader…)
│ └── contexts/
├── tests/ # Cross‑cutting tests (Vitest)
│ ├── unit/ # Unit tests (mocked deps)
│ └── integration/ # Integration tests (real temp DB + endpoints)
├── docs/ # Workflow, standards, templates, PROGRESS
├── e2e/ # Playwright
├── docker-compose.yml
└── README.md

## Key principles

- Separation of concerns: the API never touches the browser extension's code directly.
- Port/adapter pattern in app/src/db/ — storagePort.ts defines the interface, sqliteAdapter.ts implements it. This allows swapping SQLite for Postgres without changing service logic.
- Shared types (if any) will be placed in a shared/ package or simply kept in models/ and consumed via path alias.
- No circular dependencies between packages.

## Adding a new feature

1. Determine which package(s) need changes.
2. Follow folder conventions: new service in services/, new route in api/v1/, new component in ui/src/components/.
3. Create an index.ts barrel file if the folder has multiple exports.

## Naming conventions

- Module files: camelCase (`discoveryService.ts`); React components: PascalCase
  (`StumbleArea.tsx`); directories: lowercase (`api/v1/`).
- See CODING_STANDARDS.md for full naming rules.

---

Maintain this structure. Do not create new top‑level directories without a discussion.
