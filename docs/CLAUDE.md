# Stumble Clone — Gemini (Claude) Code Guide

**Project:** stumble-clone — a discover & bookmark browser extension with a Node/TypeScript API backend, a browser extension, and a React UI.

This project follows professional engineering practices: sprint planning, feature branches, mandatory PR reviews, CI gates, ≥80% test coverage. The workflow is documented in [`WORKFLOW.md`](WORKFLOW.md) and the coding standard in [`CODING_STANDARDS.md`](CODING_STANDARDS.md).

## Stack

- **TypeScript 5.x** – strict mode enabled everywhere
- **Node.js 20+** – API service (`app/`) runs on Express/Fastify (to be decided, current scaffold suggests `main.ts`)
- **React 18+ / Vite** – UI (`ui/`) uses Vite + React + TypeScript
- **Browser Extension** – plain JavaScript in `extension/` (background script, manifest)
- **SQLite** (or an adapter) – `app/db/` with `storage_port.ts` and `sqlite_adapter.ts`, following a clean/hexagonal architecture
- **Vitest** – testing framework for both `app/` and `ui/` (each has its own config)
- **Docker** – `Dockerfile` in `app/`, `docker-compose.yml` at root (already present)

## Layout

stumble-clone/
├── app/ # Backend API
│ ├── main.ts # Entry point
│ ├── config/settings.ts
│ ├── db/
│ │ ├── storage_port.ts
│ │ └── sqlite_adapter.ts
│ ├── models/asset.ts
│ ├── services/discovery_service.ts
│ ├── api/v1/ # API routes
│ └── vitest.config.ts
├── extension/ # Browser extension
│ ├── background.js
│ └── manifest.json
├── ui/ # React frontend
│ ├── src/components/
│ ├── vite.config.ts
│ └── eslint.config.js
├── tests/ # (currently unit only)
│ └── unit/
├── scripts/
│ └── build-extension.sh
├── docker-compose.yml
└── README.md

## Workflow — every change goes through this loop

1. Open a GitHub issue using the user‑story or bug template (TEMPLATES.md).
2. Branch off main: feature/<short-kebab> or fix/<short-kebab>.
3. Implement + test locally. Before pushing:
   npm run lint
   npm run format
   npm test
4. Ship via the PR workflow — push, open PR with Closes #<N> in body, watch CI, squash‑merge, delete branch, sync acceptance criteria, update PROGRESS.md.

Full conventions in WORKFLOW.md.

## Code standards (enforced by CI)

- Strict TypeScript — tsconfig.json has "strict": true in every subproject.
- Explicit return types on public functions.
- JSDoc comments on all exported entities.
- No any unless justified and commented.
- No commented‑out code.
- ESLint + Prettier – configured at the root and extended into each package.
- Coverage ≥80% — measured by Vitest.

## Testing

Two suites:

- Unit – tests/unit/ (and co‑located). No network, no DB, all adapters mocked.
- Integration – tests/integration/ (currently missing). Hit real DB, real endpoints.

### When to write what

- New module → unit tests.
- New DB adapter / external service → at least one integration test.
- Bug fixes → unit test that fails before the fix.
- Refactors → no new tests, existing suite must pass.

### Shared fixtures

- mockDatabaseAdapter – in‑memory SQLite adapter for unit tests.
- mockDiscoveryService – returns canned results.
- sampleAssets – static test data from tests/fixtures/.

## Conventions

- CamelCase for variables, functions, methods.
- PascalCase for classes, interfaces, types, React components.
- kebab-case for file names.
- .env never committed; .env.example lists required keys.
- Errors never swallowed; use typed errors.
- Logging – structured logger (e.g., pino).

## Common tasks

### Add a new API endpoint

1. Add route in app/api/v1/.
2. Create/extend service in app/services/.
3. Ensure strict typing.
4. Unit tests for handler (mock service) + integration test.
5. Update OpenAPI docs if present.

### Add a new database table

1. Define SQL in app/db/sqlite_adapter.ts.
2. Extend storage_port.ts.
3. Test with real temporary SQLite file.
4. Mirror existing try/finally pattern.

### Add a new React component

1. Create in ui/src/components/.
2. Functional component + hooks.
3. Unit tests with React Testing Library.
4. Style with project’s approach (Tailwind or CSS modules).

## Required environment variables

| Variable     | Purpose                             |
| ------------ | ----------------------------------- |
| DATABASE_URL | Connection string for SQLite        |
| API_PORT     | Port for the backend (default 3000) |
| EXTENSION_ID | ID of the browser extension         |

## Current status

Early stage — API scaffold exists, extension + UI scaffold, minimal tests. Goal: reach ai-email-copilot quality level.

See PROGRESS.md and TEMPLATES.md.
