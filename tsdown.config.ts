import { defineConfig } from 'tsdown';

const minifyFlag = true;

export default defineConfig([
  {
    entry: {
      'utils/controller': 'src/utils/server-side/controller.ts',
    },
    dts: true,
    minify: minifyFlag,
    sourcemap: !minifyFlag,
    treeshake: true,
    platform: 'node',
    format: ['esm', 'cjs'],
    target: 'es6',
    fixedExtension: false,
  },
  {
    entry: {
      'editor/index': 'src/editor/index.ts',
      index: 'src/index.ts',
      'utils/index': 'src/utils/index.ts',
      'editor/dom-helper/index': 'src/editor/dom.ts',
      'editor/svelte/index': 'src/editor/svelte/define.ts',
      'ui/i18n': 'src/ui/i18n.ts',
      'ui/validation': 'src/ui/validation.ts',
    },
    dts: true,
    minify: minifyFlag,
    treeshake: true,
    sourcemap: !minifyFlag,
    format: ['esm', 'cjs'],
    target: 'es6',
    deps: {
      alwaysBundle: ['radash'],
      onlyBundle: ['radash'],
    },
    platform: 'browser',
    onSuccess: `${process.env.CI ? 'cat build.sh && ./build.sh' : '. build.sh'}`,
    fixedExtension: false,
  },
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
    dts: false,
    minify: minifyFlag,
    sourcemap: !minifyFlag,
    treeshake: true,
    format: ['cjs'],
    target: 'node16',
    platform: 'node',
    deps: {
      alwaysBundle: ['@clack/prompts'],
      // @clack/prompts is ESM-only and pulls in its own transitive deps (@clack/core, picocolors...).
      // Enumerating them in onlyBundle would break on every bump, so bundling them is intentional.
      onlyBundle: false,
      neverBundle: [
        'esbuild',
        'esbuild-svelte',
        'svelte',
        'fast-glob',
        'sass',
        'html-minifier-terser',
        'chokidar',
        'nodemon',
        'tailwindcss',
        '@tailwindcss/node',
        '@tailwindcss/oxide',
        'postcss',
        '@fullhuman/postcss-purgecss',
        'prettyjson',
        'browser-sync',
      ]
    },
    fixedExtension: false,
  },
]);
