# Project Structure — stumble-clone

We follow a modular monorepo approach with three distinct packages.

stumble-clone/
├── app/ # Backend API (Node/TypeScript)
│ ├── main.ts # Entry point (Express/Fastify)
│ ├── config/ # Environment and app config
│ │ └── settings.ts
│ ├── db/ # Database abstraction
│ │ ├── storage_port.ts # Interface for storage operations
│ │ └── sqlite_adapter.ts # SQLite implementation
│ ├── models/ # Domain models and DTOs
│ │ └── asset.ts
│ ├── services/ # Business logic
│ │ └── discovery_service.ts
│ ├── api/ # API routes (controllers)
│ │ └── v1/
│ ├── vitest.config.ts
│ └── package.json
├── extension/ # Browser extension (JavaScript)
│ ├── background.js
│ └── manifest.json
├── ui/ # React frontend (Vite + TypeScript)
│ ├── src/
│ │ └── components/ # Reusable UI components
│ ├── public/
│ ├── eslint.config.js
│ ├── vite.config.ts
│ └── package.json
├── tests/ # Cross‑cutting tests
│ ├── unit/ # Unit tests for shared logic
│ └── integration/ # Integration tests (API + DB)
├── scripts/ # Build and utility scripts
│ └── build-extension.sh
├── docker-compose.yml
└── README.md


## Key principles

- Separation of concerns: the API never touches the browser extension's code directly.
- Port/adapter pattern in app/db/ — storage_port.ts defines the interface, sqlite_adapter.ts implements it. This allows swapping SQLite for Postgres without changing service logic.
- Shared types (if any) will be placed in a shared/ package or simply kept in models/ and consumed via path alias.
- No circular dependencies between packages.

## Adding a new feature

1. Determine which package(s) need changes.
2. Follow folder conventions: new service in services/, new route in api/v1/, new component in ui/src/components/.
3. Create an index.ts barrel file if the folder has multiple exports.

## Naming conventions

- File/directory: kebab-case (discovery-service.ts, my-feature/)
- See CODING_STANDARDS.md for full naming rules.

---

Maintain this structure. Do not create new top‑level directories without a discussion.

