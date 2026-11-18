import { join } from 'node:path';

/**
 * Folder of a static asset of the CLI (`templates`, `ai`).
 * Bundled, `__dirname` is `dist/cli` and the assets are copied to `dist/<name>`; from the sources,
 * `__dirname` is `src/cli/utils` and the assets live in `src/cli/<name>`: `../<name>` fits both.
 */
export function getCliAssetsDir(name: 'templates' | 'ai'): string {
  return join(__dirname, '..', name);
}
