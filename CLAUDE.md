# StumbleClone: Canonical Reference

## Architecture: Hexagonal (Ports & Adapters)
The system is divided into three distinct layers. Dependency always flows **inward**. This architecture is **Client-Agnostic**, meaning the same backend serves the Browser Extension, Mobile Web, and Desktop Web.

1. **Domain Layer (`app/src/domain`)**: Core business logic and entities.
2. **Ports Layer (`app/src/ports`)**: TypeScript interfaces (e.g., `IStoragePort`).
3. **Adapters Layer (`app/src/adapters`)**: Concrete implementations (e.g., `SqliteAdapter`).
4. **Web Layer (`app/src/web`)**: Entry points (Express/Fastify API).

## Multi-Platform Strategy
- **Unified UI**: The `ui/` folder contains a responsive React app.
- **Client Modes**:
    - **Extension Mode**: Runs inside the Chrome Side Panel.
    - **Mobile/Web Mode**: Runs as a PWA (Progressive Web App) on smartphones.
- **Shared API**: Both clients use the same `v1/` API endpoints.

## Coding Standards
- **Strict TypeScript**: No `any`, explicit return types for all functions.
- **Asynchronous**: Prefer `async/await` over callbacks or raw promises.
- **Error Handling**: Use custom DomainErrors; wrap external adapter errors.
- **Testing**: 80% coverage required. Domain logic must be 100% unit tested.

## Workflow Rules
1. **Issue First**: Every change must correspond to a story in `docs/PROGRESS.md`.
2. **Quality Gates**: `npm run lint`, `npm run typecheck`, and `npm run test` must pass before any logical merge.
3. **Documentation**: Keep `ARCHITECTURE.md` and `PROGRESS.md` updated.

## Key Abstractions
- `StumbleAsset`: The core entity representing a discovered URL.
- `IStoragePort`: Interface for CRUD operations on assets and ratings.
- `DiscoveryService`: Orchestrator for selecting the next URL.
