# StumbleClone: Engineering Guide

## Build & Test Commands
- **Backend Build:** `cd app && npm run typecheck`
- **Backend Test:** `cd app && npm test`
- **Backend Lint:** `cd app && npm run lint`
- **Frontend Dev:** `cd ui && npm run dev`
- **Extension Build:** `./scripts/build-extension.sh`

## Architecture & Naming
- **Modular Monolith:** Logic must be split into `api/`, `services/`, `models/`, and `db/`.
- **Snake Case:** Backend files and methods use `snake_case` (mirroring `ai-email-copilot`).
- **Pydantic-like Validation:** Use `Zod` for all data models in `app/models/`.
- **Dependency Injection:** Services must be injected with their adapters via constructor.

## Engineering Skills (Agent Actions)
- **/add-service <name>**: Create a new service in `app/services/` with a corresponding interface.
- **/add-api-v1 <name>**: Create a new versioned API route and register it in `main.ts`.
- **/fix-lint**: Run prettier and eslint across the workspace.

## Quality Gates
- **Tests:** 80% coverage on the `services/` layer.
- **Types:** Strict TypeScript; no `any`.
- **Architecture:** No bypassing the `db/` layer; no DB calls in `api/`.
