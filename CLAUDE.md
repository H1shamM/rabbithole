# StumbleClone — Claude Code Context

A modern StumbleUpon clone (serendipitous web discovery). Migrated from Gemini CLI to
Claude Code on 2026-06-08. Functionality is solid; the build was repaired (see Build
health) and the UI is being redesigned to a clean SaaS look (sidebar + main).

## Layout (monorepo, npm workspaces-style)

- `app/` — Backend. Node + TypeScript + Express 5 + better-sqlite3. Hexagonal (ports & adapters).
  - `npm start` (tsx src/main.ts) → http://localhost:3000. Seeds `stumble.db` on first run.
  - `npm test` (vitest), `npm run lint`.
- `ui/` — Frontend. React 19 + Vite 8 + TypeScript 6 + Tailwind v4 + shadcn/ui (Radix).
  - `npm run dev` → http://localhost:5173. `npm run build` (tsc -b && vite build).
  - `npm test` (vitest), `npm run lint`, `npm run typecheck` (see gotcha below).
- `extension/` — Optional Chrome extension. `e2e/` — Playwright. `docs/` — design docs.

## Run both

1. `cd app && npm start`
2. `cd ui && npm run dev`

## Redesign (modern SaaS / clean, sidebar + main layout) — complete

Reconciled onto current master on `feature/saas-ui-overhaul` (supersedes the prior UI):
1. Indigo oklch design-token system (`globals.css`), sidebar + main app shell (`App.tsx`).
2. `Sidebar.tsx` (brand + vertical category nav + install) and `Header.tsx` rebuilt as a
   sticky top bar (search + theme + the avatar/dropdown user menu kept from master).
   `CategoryBar.tsx` removed (duties split between them).
3. `StumbleArea.tsx` (all states) + `ActionButtons.tsx` redesigned with Lucide icons; the
   latter is now a floating pill action bar.
4. History/Favorites/Recommendations panels, `SubmissionForm`, and modals polished
   (emoji → Lucide); `Sidebar.test.tsx` added.
Notes: `App.tsx` keeps a `data-theme` attribute effect — a test asserts it; don't remove.
Empty-state stumble button accessible name is `"Stumble"` (tests rely on it).
Screenshot helper: `node shot.mjs` from repo root (needs both servers running).

## UI/UX standards (from GEMINI.md — keep following these)

- Code-ownership of components (own the source, not black-box libs).
- Design tokens via CSS variables (color/spacing/typography/shadow).
- Stack: Tailwind v4, shadcn/ui (Radix primitives), Framer Motion, React Hook Form + Zod, Lucide icons.

## Build health

Clean baseline established 2026-06-08: `npm run build` ✓, `npm run lint` ✓, 27 tests ✓.

- **Tailwind v4 was never wired into the build** (root cause of the "terrible UI" — the app
  rendered with zero CSS). Fixed by installing `@tailwindcss/vite` and adding `tailwindcss()`
  to `ui/vite.config.ts` plugins. `globals.css` uses `@import "tailwindcss"` which is inert
  without that plugin. If styles ever vanish again, check this plugin first.
- `npm run typecheck` was a no-op (root `tsconfig.json` has `"files": []`); now points to `tsc -b`
  (build mode, respects project references) so it actually checks the source.
- `ui/tsconfig.app.json` has `"ignoreDeprecations": "6.0"` to allow `baseUrl` under TS 6.

### Fixed during migration (for reference)

- `App.tsx`: removed calls to undefined `setEmail`/`setPassword`; typed CategoryBar `onCategoryChange`.
- `ui/button.tsx` `Slot.Root`→`Slot`; `ui/label.tsx` switched to `import * as LabelPrimitive`.
- `process.env.NODE_ENV` → `import.meta.env.MODE` in browser code (ErrorBoundary, StumbleArea).
- Removed unused `React` imports (React 19 JSX transform) and unused `@ts-expect-error` directives;
  type-only imports under `verbatimModuleSyntax` (form.tsx, ErrorBoundary).

## Conventions

- Conventional Commits (`feat(ui):`, `fix(test):`, `style(ui):` …).
- Husky + lint-staged pre-commit (eslint --fix). Prettier for formatting.
