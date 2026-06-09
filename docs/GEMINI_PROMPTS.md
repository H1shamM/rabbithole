# Gemini CLI Prompt Snippets

> ⚠️ **These examples are illustrative starting points and are partly dated** — they
> predate the current codebase. Ignore their specifics where they conflict with the repo:
> files are **camelCase** (`discoveryService.ts`, not `discovery_service.ts`), the branch is
> **`master`** (not `main`), and **CI already exists**. In practice the junior works from
> **`gemini-ready` GitHub issues** written with `.github/ISSUE_TEMPLATE/gemini-task.md`
> (explicit file allowlist + acceptance criteria), not these snippets. Canonical guidance:
> root `CLAUDE.md`, `GEMINI.md`, `CODING_STANDARDS.md`.

Use these prompts as templates when asking Gemini to implement something in stumble-clone. Each prompt assumes the assistant has read the other guide files.

## Create a new API endpoint

You are working on the stumble-clone project. Follow CLAUDE.md, CODING_STANDARDS.md, and TESTING_GUIDE.md.
Add a new GET /api/v1/assets endpoint that returns a list of assets from the discovery service.

- Add the route handler in app/api/v1/assets.ts.
- It should call the existing DiscoveryService (already in app/services/).
- Write unit tests using mocked StoragePort, and one integration test that spins up the server (use supertest).
- Ensure strict TypeScript, no any, and all exports have return types.
- Update PROGRESS.md with the new task status.

## Write tests for an existing module

The discovery_service.ts module needs better test coverage. Following TESTING_GUIDE.md, write:

- Unit tests for discover() covering: empty store, store with multiple assets, store throws an error.
- Integration test that uses a real temporary SQLite database (via the adapter).
- Ensure the coverage reaches 80 percent for that file.
- Use Vitest mocks, not real network calls.

## Add a new database table

I need to add a tags table to store user‑defined tags for assets.

- Add the CREATE TABLE statement in sqlite_adapter.ts (or a migration function).
- Extend StoragePort with addTag/removeTag/getTagsForAsset methods.
- Implement them in sqlite_adapter.ts.
- Write unit tests for the new methods (using an in‑memory SQLite database).
- Update the Asset model if needed.
- Follow the existing code patterns (try/finally for DB connections).

## Set up CI (GitHub Actions)

Create a .github/workflows/ci.yml that:

- Runs on push to any branch and on pull requests to main.
- Uses Node 20.
- Runs npm ci in the root.
- Runs npm run lint and npm test (with coverage).
- Fails if coverage is less than 80 percent.
- Use the existing vitest.config.ts for coverage thresholds.

## Add a new React component

Create an AssetCard component in ui/src/components/AssetCard.tsx.

- It should accept an Asset object as a prop and display its url and any tags.
- Use TypeScript strict, no any.
- Write a unit test with React Testing Library (if not installed, add it first).
- Style with CSS modules (or Tailwind if we decide).

---

These prompts are starting points. You can adapt them by changing the specific requirements while keeping the context link to the guide files.
