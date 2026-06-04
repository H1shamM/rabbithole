# StumbleClone Architecture

## System Overview
StumbleClone is a serendipitous discovery engine designed as a **Modular Monolith** with a **Hexagonal (Ports & Adapters)** core. This ensures the business logic (Discovery) is decoupled from the infrastructure (SQLite, Express).

## Directory Structure
```
stumble-clone/
├── app/                # Core Application Logic
│   ├── api/            # API Layer (Express Routes)
│   ├── services/       # Service Layer (Business Logic/Orchestration)
│   ├── models/         # Domain Models (Zod Schemas)
│   ├── db/             # Persistence Layer (SQLite Adapters)
│   └── config/         # Configuration (Environment Settings)
├── tests/              # Multi-tier Testing Suite
│   ├── unit/           # Isolated logic tests
│   └── integration/    # System-level interaction tests
├── ui/                 # Frontend (Vite + React + TypeScript)
├── extension/          # Browser Extension Manifest & Background
└── infra/              # Infrastructure-as-code & Deploy configs
```

## Hexagonal Flow
1. **Request** hits `api/v1/discovery_routes.ts`.
2. **Route** calls `services/discovery_service.ts`.
3. **Service** uses `db/storage_port.ts` to interact with data.
4. **Adapter** (`db/sqlite_adapter.ts`) executes SQLite commands.
5. **Model** (`models/asset.ts`) ensures data integrity at every boundary.

## Performance & Scaling
- **Task Offloading:** Future scaling will involve Celery-like background tasks for URL health checks.
- **Stateless API:** The backend is stateless, allowing for horizontal scaling if moved to a distributed DB.
