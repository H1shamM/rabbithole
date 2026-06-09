# StumbleClone — Claude Code Context

A modern StumbleUpon clone (serendipitous web discovery). Migrated from Gemini CLI to
Claude Code on 2026-06-08. Build is healthy, the SaaS UI is shipped, and **in-app
reader-first viewing is live**. Sprint 5 (S5-01…S5-04) is complete — see `docs/PROGRESS.md`.

## Layout (monorepo)

- `app/` — Backend. Node + TypeScript + Express 5 + better-sqlite3. Hexagonal (ports & adapters).
  - `npm start` (tsx src/main.ts) → http://localhost:3000. Seeds `stumble.db` on first run.
  - `npm test` (vitest, tests live in repo-root `tests/`), `npm run lint`.
  - **Content sources** implement `ContentFetcher` (`app/src/sources/*.ts`, one `fetchStumble` method)
    and are registered in `app/src/app.ts`'s `sources` array. Adding a source = new class + that
    registration + a unit test in `tests/unit/sources/` (mock `global.fetch`).
- `ui/` — Frontend. React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + shadcn/ui (Radix).
  - `npm run dev` → http://localhost:5173. `npm run build` (tsc -b && vite build).
  - `npm test` (vitest), `npm run lint`, `npm run typecheck` (= `tsc -b`).
- `docs/` — workflow/standards/templates/PROGRESS. `extension/` — Chrome ext. `e2e/` — Playwright.

Run both: `cd app && npm start` then `cd ui && npm run dev`.

## ⚙️ Two-agent workflow (senior = Claude/Hisham, junior = Gemini bot)

This repo is developed by **two AI agents**:
- **Senior (Claude, as `H1shamM`, this machine)** — scopes work into GitHub issues, reviews PRs,
  and is the only one who merges. Owns architecture/security/cross-cutting work.
- **Junior (`H1shamM-bot`, Gemini Flash Lite, on a separate laptop)** — picks up small
  `gemini-ready` issues, implements them on `feat/`/`fix/` branches, opens PRs. It **cannot push
  to `master` or merge** (Write-only collaborator + branch protection; proven).

Mechanics:
- `master` branch protection: PR required + CI green (`test (app)` + `test (ui)`) + 1 code-owner
  review (CODEOWNERS = `@H1shamM`). Admin bypass is ON for the owner (so the senior can admin-merge
  its *own* PRs since it can't self-approve).
- Junior tasks = GitHub issues labeled **`gemini-ready`**, assigned to `H1shamM-bot`, written with the
  `.github/ISSUE_TEMPLATE/gemini-task.md` template (atomic, explicit file allowlist, acceptance
  criteria, "do not merge"). The junior's hard rules live in `GEMINI.md` (root).
- The senior reviews each bot PR against its issue's acceptance criteria; merges if it meets spec,
  else posts a precise change-request.
- **Recurring junior pitfalls to watch for on review:** branches off stale state (stacking), forgets
  the `app.ts` source registration, mixes two issues in one PR. Catch these on review.
- A senior review loop can run via the `/loop` skill (poll bot PRs, review, merge). The junior loops
  via a `while/sleep` script on its laptop (Gemini CLI has no native scheduler).

## 🧭 In-app reader-first viewing (S5-04, done)

The headline feature — stumbles render *inside* the app instead of a blank iframe:
- Backend `GET /api/v1/reader?url=` (`app/src/services/readerService.ts` + `readerController.ts`)
  extracts the main article with `@mozilla/readability` (jsdom), **sanitizes** it (`sanitize-html`),
  returns clean JSON; 422 when not article-like; never 500. SSRF guard in `utils/urlGuard.ts`.
- `StumbleArea.tsx` is **reader-first hybrid**: default to the extracted reader view (`ReaderView` +
  `useReader`), a **Reader/Live `ViewModeToggle`**, open-in-tab. **Video** stumbles (embeddable
  `/embed/` proxyUrl, e.g. YouTube) auto-default to a 16:9 live player. When reader fails and the user
  hasn't chosen Live, a "reader unavailable" card shows (no blank pages).
- Search (`App.tsx`) drives the main view: results show in StumbleArea, Next cycles them, Exit returns
  to random. Spacebar = next; rating shows a toast.

## Build / CI health

`npm run build` ✓, lint ✓, typecheck (`tsc -b`) ✓, full test suite ✓.
- **CI runs Node 24** (`.github/workflows/ci.yml`) to match local npm 11 — this fixed the recurring
  `npm ci` "lock out of sync" failures. If you add a dep and CI's `npm ci` complains, regenerate the
  lock fully: `rm <pkg>/package-lock.json <pkg>/node_modules && npm install`.
- **Tailwind v4** is wired via `@tailwindcss/vite` in `ui/vite.config.ts` (without it `@import
  "tailwindcss"` is inert and the app renders with zero CSS — the original "terrible UI"). The reader
  prose uses `@tailwindcss/typography` (`@plugin` in `globals.css`).
- `ui/tsconfig.app.json` has `"ignoreDeprecations": "6.0"` (baseUrl under TS 6).

## Conventions & gotchas

- **Workflow is strict** (`docs/WORKFLOW.md`): issue → `feat/`|`fix/` branch off master → tests →
  lint/format → Conventional Commit `Closes #N` → PR (template) → CI → squash-merge → update PROGRESS.
  This applies to the senior too (issue-first; admin-merge own PRs when CI green).
- **No `Co-Authored-By: Claude` trailer** in commits (portfolio repo — author is Hisham only).
- `App.tsx` keeps a redundant `data-theme` attribute effect — a test asserts it; don't remove.
  Theme actually applies via the `.dark` class (`useTheme`).
- Tests rely on: empty-state button accessible name `"Stumble"`; `iframe title="Stumbled page"`;
  ActionButtons aria-labels (`Like`/`Dislike`/`Save to favorites`). Vitest has no auto-cleanup — call
  `afterEach(cleanup)` in component tests.
- Husky + lint-staged pre-commit (eslint --fix). Prettier for formatting.
- Local helper scripts (`shot.mjs`, `walkthrough.mjs`, `diag.mjs`, `*.png`) are gitignored.

## UI/UX standards (from GEMINI.md)

Code-ownership of components; design tokens via CSS variables; Tailwind v4 + shadcn/ui (Radix) +
Framer Motion + React Hook Form/Zod + Lucide icons. Indigo oklch token system; sidebar + main layout.
