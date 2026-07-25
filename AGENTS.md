# AGENTS.md

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
  Run `pnpm lint:check` to check. **`pnpm format` is check-only** (`biome format` without
  `--write`) — it does not fix anything despite the name. To actually apply fixes, run
  `pnpm exec biome check --write .` (add `--unsafe` only after reviewing the proposed changes,
  e.g. for `noUnusedImports`).
- Shared, cross-cutting helpers used by more than one `src/builder/*` submodule live in
  `src/tools/` (not nested under `src/builder/`), e.g. `node-utils.ts` (`writeFile`,
  `createFolderIfNotExists`, `cleanPaths`, `distributionPackagePath`) and
  `esbuildBaseOptions.ts` (`getEsbuildBaseOptions`, the fields common to both the controller and
  editor esbuild calls). A helper used by only one `locales/*` file's siblings (e.g.
  `locales/localeEntry.ts`'s `readLocaleEntry`, shared between `globalLocales.ts` and
  `scopedNodesLocales.ts`) stays colocated inside that submodule instead.

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

## Gotchas & non-obvious constraints

- **"glob on a literal, non-wildcard path" is an existence check in disguise** — found twice
  (`current-context.ts`'s `listNodeFolders`, `editor/html.ts`'s pug-file lookup) before being
  fixed to plain `existsSync`/`fsPromise.access`. If you see `globSync(someExactPath)[0]` or
  `.at(0)`, it almost always means "does this file exist", and glob's directory-walking machinery
  is unnecessary overhead for that.
- **`pug@3.0.4` has no async `renderFile`** — it's sync-only, CPU-bound templating. Don't try to
  convert it; it's not the bottleneck, and there's no promise API to convert to.
- **`sass` (dart-sass) `compileAsync` is not real parallelism** unless you switch to the separate
  `sass-embedded` package — the plain `sass` package wraps the same synchronous compiler in an
  already-resolved Promise (no worker thread). Useful for API consistency and not blocking style
  in already-`Promise.all`'d code, but don't expect wall-clock gains from awaiting several
  `compileAsync` calls concurrently.
- **`fast-glob@3.3.3` exports both `globSync` (sync) and `glob` (async)** as named exports off its
  CJS `export =` — `import { glob } from 'fast-glob'` works fine for the async path.
- **Watch mode has no debounce and always does a full rebuild.** `src/cli/commands/watch/watcher.ts`
  uses `chokidar.watch(...)` with no `awaitWriteFinish`/debounce, and calls the same `build()` used
  by `pnpm build` on every single file change, regardless of which file changed. Any perf work in
  `src/builder` benefits both `pnpm build` and the watch loop equally — there's no separate
  "incremental" path to optimize.
- **The CLI's `build` command minifies by default.** `build.cli.ts` registers the flag as
  `.option('--no-minify', ...)`, so `node-red-dxp build` with no flags runs with `minify: true`;
  pass `--no-minify` to get the raw, unpurged CSS/JS (useful when debugging why some CSS class
  seems to have disappeared from the output — check PurgeCSS before assuming a bug).
- **There's no e2e fixture project in this repo** to dogfood the builder end-to-end. To
  smoke-test manually: scaffold a minimal project matching the `docs/get-started.md` structure
  anywhere on disk, and make sure its `package.json` has
  `"devDependencies": { "@keload/node-red-dxp": "*" }` — the CLI's `isInProject()` check
  (`src/cli/index.ts`) walks up from `cwd` looking for that dependency to decide whether to expose
  the full command set (`build`/`watch`/...) or fall back to the bare `create`-only CLI. Then run
  `node <this-repo>/dist/cli/index.cjs build` from inside the fixture.

## Business context (for judgment calls, not enforced by code)

- Node count per package varies widely across real projects — don't design/optimize for one
  specific scale (neither "always tiny" nor "always huge").
- Windows must remain a supported dev platform — avoid hardcoded `/` path concatenation in new
  code that touches the filesystem directly; prefer `path.join`/`path.sep`, matching what
  `locales/scopedNodesLocales.ts` already does.
- `src/red-server.ts` (custom Node-RED backend endpoints) and the `resources/` directory (global
  JS/CSS injected into the editor) are common, frequently-used features in real projects, not
  niche/rarely-used ones — treat their observable behavior as a stable contract.

## Commands

- `pnpm build` — `tsdown`, gated by `pnpm tsc --noEmit` (the `prebuild` script; this is the real
  type-check gate since `tsconfig.json` has no `strict`).
- `pnpm test:unit` — Vitest. Run a single file/subset with `pnpm exec vitest run <path>`.
- `pnpm docs:dev` / `docs:build` — VitePress site, regenerated from `generate-docs.ts` (TypeDoc
  over a fixed set of entry points — `src/builder` is intentionally not part of the generated API
  docs, since it's internal, not a consumed public surface).
