# Coding Standards — stumble-clone

Derived from ai-email-copilot’s code standards, adapted to TypeScript and Node/React.

---

## TypeScript

- **Strict mode** is mandatory in every tsconfig.json:
  "strict": true
- **Explicit return types** on all exported functions and methods.
  ✅ function getAsset(id: string): Promise<Asset | null>
  ❌ function getAsset(id: string) (no return type)
- **No any** – use unknown and narrow, or // @ts-expect-error with explanation.
- **Interface vs Type**: prefer interface for object shapes meant to be extended; type for unions, intersections, and aliases.
- **Enums**: allowed but prefer union types for simpler cases (e.g., type Category = 'work' | 'personal').
- **Nullish coalescing** (??) and **optional chaining** (?.) are encouraged.

## Naming

- **Files**: kebab-case (discovery-service.ts, user-repository.ts).
- **Directories**: kebab-case (api/v1/).
- **Classes / Interfaces / Types**: PascalCase (Asset, StoragePort).
- **Functions / Methods / Variables**: camelCase (fetchAssets, isValidUrl).
- **Constants**: UPPER_SNAKE_CASE for true constants; for runtime configuration, camelCase is fine.
- **React components**: PascalCase (AssetCard.tsx).

## Imports

- Order: external packages → internal modules → relative imports.
- Use path aliases where configured (e.g., @/services).
- Avoid deep relative paths (../../../) – prefer aliases or barrel files (index.ts).

## Functions & Modules

- **Single responsibility**: each function does one thing well.
- **Keep functions small** – ideally under 30 lines.
- **Avoid side effects** in modules; document any that exist.
- **Export a single public API** from a folder via index.ts.

## Comments

- **Do not comment what** the code does – the code should be self-explanatory.
- **Comment why** – non‑obvious constraints, workarounds, algorithmic choices.
- **JSDoc on all exported functions** – at least a one‑line description. Add @param and @returns for complex signatures.

## Error Handling

- **Never swallow exceptions** – log and/or re‑throw with context.
- **Use custom error classes** for domain errors (e.g., AssetNotFoundError).
- **Async functions**: use try/catch, avoid unhandled promise rejections.
- **HTTP handlers**: always return proper status code and JSON body.

## Code Style (automatic)

We use **ESLint** and **Prettier**. Config:

- Root eslint.config.js or .eslintrc
- ui/eslint.config.js (extend to app/)
- Prettier: singleQuote: true, trailingComma: 'all', semi: true.

Run before every commit:
npm run lint -- --fix
npm run format

---

**Remember:** the goal is code as clean, typed, and testable as a well‑written Python project – but in TypeScript.
