# CLAUDE.md

`@keload/node-red-dxp` is a CLI + library for building and watching Node-RED node packages: it
compiles a "controller" bundle (backend, Node.js/CJS) and an "editor" bundle (frontend, browser
IIFE) from a node package's source tree, plus locale and doc files. Public docs live in `docs/`
(VitePress, published at https://clement-berard.github.io/node-red-dxp/); this file only covers
conventions, not features.

## Code style

- **Functions, not classes.** Use plain functions with destructured object params (e.g.
  `function buildEditor({ minify = false } = {})`) instead of classes for anything that's really
  "config in, result out". Reserve classes for cases with genuine instance identity or mutable
  internal state accessed by multiple methods over time — none of the current codebase needs
  that. `src/builder` is the reference example of this style.
- Filename ≈ primary exported function name, camelCase (`buildController.ts` exports
  `buildController`, `writeLocales.ts` exports `writeAllLocales`, etc.).
- Imports are relative — no path aliases (`tsconfig.json` has no `baseUrl`/`paths`).
- `strict` mode is off and `noExplicitAny` is disabled in Biome; don't over-invest in typing
  gymnastics, but keep `any` local and justified rather than propagating through signatures.
- Biome (not ESLint/Prettier) handles lint + format: single quotes, 2-space indent, 120 col.
  Run `pnpm lint:check` / `pnpm format`.

## `src/builder` layout

```
src/builder/
├── build.ts          # build({minify}) — orchestrates the three tasks below in parallel
├── controller/        # backend bundle (esbuild, node/cjs target)
├── editor/             # frontend bundle (esbuild, browser/iife) + HTML/CSS/docs assembly
└── locales/            # merges global + per-node locale JSON, writes them to dist
```

Each folder is one peer concern; a file only moves in if it's exclusively consumed by that
concern (e.g. `editor/docs.ts` lives under `editor/` because docs are only ever embedded into the
editor HTML).

## Tests

- Vitest, colocated under `__tests__/` next to the source it covers, no global config file.
- Mock the shared `currentContext` singleton (`src/current-context.ts`) via
  `vi.mock('../../current-context', () => ({ currentContext: {...} }))` — see
  `src/builder/editor/__tests__/resources.test.ts` for the pattern. Only stub the fields the
  test actually reads.
- Use `vi.hoisted()` to declare mock functions referenced inside `vi.mock(...)` factories.

## Commands

- `pnpm build` — `tsdown`, gated by `pnpm tsc --noEmit` (the `prebuild` script; this is the real
  type-check gate since `tsconfig.json` has no `strict`).
- `pnpm test:unit` — Vitest.
- `pnpm docs:dev` / `docs:build` — VitePress site, regenerated from `generate-docs.ts` (TypeDoc
  over a fixed set of entry points — `src/builder` is intentionally not part of the generated API
  docs, since it's internal, not a consumed public surface).
