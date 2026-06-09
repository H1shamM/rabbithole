# StumbleClone — docs context pointer

> This file used to hold a full project guide that drifted badly out of date (wrong
> stack versions, snake_case file names, an "early stage" status). The **canonical
> context now lives elsewhere** — use these instead:

- **Root [`/CLAUDE.md`](../CLAUDE.md)** — the live project context: stack, layout, the
  discovery engine & rendering, the two-agent workflow, build/CI health, conventions.
- **[`PROGRESS.md`](PROGRESS.md)** — sprint history and current focus (Content & Rendering v2).
- **[`WORKFLOW.md`](WORKFLOW.md)** — issue → branch → PR → merge process.
- **[`CODING_STANDARDS.md`](CODING_STANDARDS.md)** — TypeScript / naming / error-handling rules.
- **[`TESTING_GUIDE.md`](TESTING_GUIDE.md)** — Vitest unit/integration conventions.
- **[`TEMPLATES.md`](TEMPLATES.md)** — issue & PR templates.
- **`GEMINI.md`** (repo root) — the junior agent's hard rules.

## Quick facts (authoritative)

- **Backend** `app/` — Node + TypeScript + **Express 5** + better-sqlite3, hexagonal
  (ports & adapters). Source under `app/src/`. Entry `app/src/main.ts`.
- **Frontend** `ui/` — **React 19** + Vite + Tailwind v4 + shadcn/ui.
- **Tests** in repo-root `tests/` (unit + integration), Vitest. **CI runs Node 24.**
- **File naming:** camelCase for modules (`discoveryService.ts`), PascalCase for React
  components (`StumbleArea.tsx`). See CODING_STANDARDS.md.
- **Status:** production-grade build; Sprints 1–6 complete; Sprint 7 (Content &
  Rendering v2) in progress. *Not* early-stage.
