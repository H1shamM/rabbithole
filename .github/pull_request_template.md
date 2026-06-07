Closes #n/a (Linting fix)

### Summary

Fixes linting errors in `app/` and `ui/` directories to resolve CI pipeline failures. Updated `app/` with a proper ESLint flat config and added necessary dependencies. Fixed specific linting errors in `app/main.ts` and `ui/src/components/App.tsx`.

### Changes

- `app/package.json`: Added `eslint`, `@eslint/js`, `globals`, `typescript-eslint` dependencies.
- `app/eslint.config.js`: Created new ESLint flat config file.
- `app/main.ts`: Fixed syntax typos (`expresson` -> `express.json`, `reson` -> `res.json`) and addressed unused variables.
- `ui/src/components/App.tsx`: Resolved React hooks linting errors by restructuring `fetchInterests` inside `useEffect`.

### Test Plan

- [x] All existing tests pass (verified in `app/`)
- [x] Linting clean (`npm run lint` passes in both `app/` and `ui/`)
- [x] Manual test: Verified code compiles and linting errors are resolved.
