# Rabbithole — Claude Code Context

A modern StumbleUpon clone (serendipitous web discovery). Migrated from Gemini CLI to
Claude Code on 2026-06-08. Build is healthy, the SaaS UI is shipped, in-app reader-first
viewing is live, and the **discovery engine has been hardened** (URL dedup, content-type
gate, session dedup, source cooldown, type-aware rendering). Sprints 5–6 are complete —
see `docs/PROGRESS.md`.

**The app is now a native Android app, and the live product is mobile-first.** The web SaaS UI is the
prototype; the real target ships via **Capacitor** (Android; iOS deferred, no Mac). The
**Content & Rendering v2** work (Sprint 7: 24-item curated library #173, render-by-type preview cards
#172) and the **Explainer Mode epic (#215)** are **fully merged** (B1–B4, F1–F4, P1, P2 — the LLM
"re-tell a article as a scene reel", Haiku 4.5, hexagonal per `docs/EXPLAINER_BUILD_PLAN.md`).

**Browse v2 / Reels-first mobile (epic #295/#278) — SHIPPED.** Each stumble's live site renders in a
native WebView (`@teamhive/capacitor-webview-overlay`, `ui/src/components/LiveFeed.tsx`); swipe/Next
through live sites. Tester-confirmed model: **on native there is no separate "reel mode" — mobile _is_ the
full app, the live site renders inline with the header always above it** (card + reader view is web-only).
Shipped: reels-default inline + swipe handle + haptics + layering fix (**#296**); an **immersive toggle**
(full-screens the site; overlay `ResizeObserver` resizes the native view; restore strip); **page-enhancement
injection** (`ENHANCE_PAGE`) — mobile-friendly normalization + _conservative_ cosmetic ad/cookie-wall/popup
hiding; and the **reader toggle for articles (#284)**.

**Content-safety gate (epic #332, M4) — SHIPPED (was the launch blocker).** Every asset has a
`safety_status` and only `pass` is served (fail-closed). See "Content safety" under the discovery section.

**Current state: pre-launch.** The product is **Rabbithole** (renamed from "StumbleClone"; appId rename
deferred to store-prep #331). The engineering bar is **enforced by CI** — see `docs/WORKFLOW.md` (the
contract) and Build/CI health below. **Next / remaining:** run `npm run backfill:safety` with
`ANTHROPIC_API_KEY` set (verifies the seed library); **M5 store readiness**; #331 appId rename; plus
housekeeping (#309 TODO triage, #311 admin-bypass, #312 backlog, #326 .gitattributes, README↔PRD align).
Device build/install loop + the LAN-IP/`CAP_BUILD=1` gotchas live in the [[mobile-device-dev-setup]] memory
and `docs/PROGRESS.md`. The junior bot picks up `gemini-ready` issues; keep bot PRs to one issue off current
master (recurring pitfalls: stale branches, mixed/deletion PRs, out-of-allowlist edits — catch on review).

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
- `docs/` — workflow/standards/templates/PROGRESS. `extension/` — Chrome ext.

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
  its _own_ PRs since it can't self-approve).
- Junior tasks = GitHub issues labeled **`gemini-ready`**, assigned to `H1shamM-bot`, written with the
  `.github/ISSUE_TEMPLATE/gemini-task.md` template (atomic, explicit file allowlist, acceptance
  criteria, "do not merge"). The junior's hard rules live in `GEMINI.md` (root).
- The senior reviews each bot PR against its issue's acceptance criteria; merges if it meets spec,
  else posts a precise change-request.
- **Recurring junior pitfalls to watch for on review:** branches off stale state (stacking), forgets
  the `app.ts` source registration, mixes two issues in one PR. Catch these on review.
- A senior review loop can run via the `/loop` skill (poll bot PRs, review, merge). The junior loops
  via a `while/sleep` script on its laptop (Gemini CLI has no native scheduler).

## 🧭 Discovery engine & rendering

**Selection** (`app/src/services/discoveryService.ts`, `stumble()`): weighted-random over the
category pool. Weight = `1 + user category-pref + user source-pref`, then a **source cooldown**
(#155) multiplies by `0.05` if the asset's source appeared in the last `COOLDOWN_WINDOW` (4)
history ids, floored at `0.1` (disfavored, not banned). **Session dedup** (#147): the UI
(`useStumble.ts`) tracks seen ids and sends them as `history`; the backend filters them and, when
the pool is exhausted, fetches live then falls back to the full pool (503 only on a truly empty
corpus). Pool grows **eagerly** toward `TARGET_POOL` (background top-up); `UNIQUE(url)` + an upsert
prevent duplicate rows.

**Content types & the gate** (`app/src/services/assetGate.ts`): every asset has a
`type` (`article | image | video | interactive`; nullable `type` column). `classifyAsset` tags it —
videos (`/embed/`) and known visual/interactive sources pass without article extraction; unknown
pages must extract (`extractReadable`) to be servable. This replaced the old article-only boolean
gate that flattened everything into a reading list. The cold-start pool is a **curated library**
(`bootstrap.ts` `DEFAULT_SEED_ASSETS`): 24 hand-picked items across 8 **channels** (nullable
`channel` column) — source-capped (≤2) and format-diverse (eval-session 3/4 lessons).

**Content safety** (epic #332, the launch-blocker gate — `app/src/services/safetyService.ts`): every asset
has a `safety_status` (`pending | pass | flag`) and **only `pass` is ever served** (fail-closed filter on
all discovery queries in `sqliteAdapter`). Classification is cheapest-first: `screenHeuristics` (domain
blocklist in `config/safetyBlocklist.ts`, zero cost) → an LLM (`SafetyLLM` port + `adapters/claudeSafety.ts`,
`claude-haiku-4-5` + structured outputs, mirrors `claudeExplainer`) for the rest; flags
sexual/violence/spam/hate. Wired into ingest (`discoveryService.fetchFromLiveSources` only saves `pass`); an
LLM error → `pending` (never a false pass); missing `ANTHROPIC_API_KEY` → heuristics-only. Seeds default to
`pass` (so fresh installs aren't empty) and are verified by **`npm run backfill:safety`** (`backfillSafety`,
re-classifies the whole library). **Report + block**: `POST /api/v1/report` (`reportController`) records a
report and blocks that URL for the user (`blocked_urls`, filtered out of their pool); report button on web
`ActionButtons` + mobile `LiveFeed`.

**Reader** (`readerService.ts` + `readerController.ts`): `GET /api/v1/reader?url=` extracts the main
article with `@mozilla/readability` (jsdom), **sanitizes** (`sanitize-html`), in-memory cached,
rejects thin/<400-char extractions; 422 when not article-like, never 500. SSRF guard in
`utils/urlGuard.ts`.

**Rendering** (`StumbleArea.tsx`, type-aware, #154): `article` → reader (`ReaderView` + `useReader`);
`video` → 16:9 player using the **direct `/embed/`** URL (#176, not `/proxy`); `image`/`interactive`
→ a **preview card** (#172) — `PreviewCard` + `usePreview` + `GET /api/v1/preview` extracts
og:image/title/description, so un-iframable sites show a real card (title + image + "Open the site"),
never a blank iframe. A **Reader/Live `ViewModeToggle`** overrides for articles; a "reader
unavailable" card shows on extraction failure. **Open lever (session 5):** sites without an
`og:image` get a bare card — a real screenshot backstop (#179) is the top conversion fix; videos
get thumbnail cards (#180).

Search (`App.tsx`) drives the main view: results show in StumbleArea, Next cycles them, Exit returns
to random. Spacebar = next; rating shows a toast.

## Build / CI health

`npm run build` ✓, lint ✓, typecheck (`tsc -b`) ✓, full test suite ✓ (app 101, ui 99 — green
locally and in CI).

- **CI** (Node 24) is split into three workflows — `lint.yml` (eslint + typecheck), `tests.yml`
  (test + coverage), `guards.yml` (no committed `*.log`); required checks `lint (app)`/`lint (ui)`/
  `test (app)`/`test (ui)`/`guards`. **Coverage is gated** via `thresholds` in each `vitest.config.ts`
  (app ≥69 stmts; ui ≥73 stmts) — a PR that drops coverage fails CI. See `docs/WORKFLOW.md` (the contract).
- If you add a dep and CI's `npm ci` complains "lock out of sync", regenerate the lock fully:
  `rm <pkg>/package-lock.json <pkg>/node_modules && npm install`.
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
- **DB tests must be hermetic** (#306): construct `SqliteAdapter`/`Database` with `":memory:"` and
  `close()` in `afterEach`/`afterAll`. Never use a shared on-disk `test_*.db` — the open handle fails
  `unlink` on Windows (`EBUSY`), leaving stateful files that pass in CI's clean checkout but fail locally.
- Husky + lint-staged pre-commit (eslint --fix + prettier --write). Prettier (defaults, no
  `.prettierrc`) is the format gate — CI's `guards` job runs `npm run format:check`; `.prettierignore`
  excludes generated/vendor (android, dist, coverage, lockfiles).
- Local helper scripts (`shot.mjs`, `walkthrough.mjs`, `diag.mjs`, `*.png`) are gitignored.

## UI/UX standards (from GEMINI.md)

Code-ownership of components; design tokens via CSS variables; Tailwind v4 + shadcn/ui (Radix) +
Framer Motion + React Hook Form/Zod + Lucide icons. Indigo oklch token system; sidebar + main layout.
