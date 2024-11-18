import { defineConfig } from 'tsup';

const minifyFlag = true;

const externals = [
  'esbuild',
  'glob',
  'del',
  'sass',
  'html-minifier-terser',
  'chokidar',
  'consola',
  'nodemon',
  'prettyjson',
  'browser-sync',
];

export default defineConfig([
  {
    entry: {
      'editor/index': 'src/editor/index.ts',
      index: 'src/index.ts',
    },
    clean: true,
    bundle: true,
    dts: true,
    minify: minifyFlag,
    minifyWhitespace: minifyFlag,
    minifyIdentifiers: minifyFlag,
    minifySyntax: minifyFlag,
    treeshake: true,
    format: ['esm', 'cjs'],
    target: 'es6',
    noExternal: ['merge-anything'],
    external: externals,
    onSuccess: 'cp -r src/editor/assets dist/editor',
  },
  {
    entry: {
      'builder/index': 'src/builder/index.ts',
    },
    clean: true,
    bundle: true,
    dts: true,
    minify: minifyFlag,
    minifyWhitespace: minifyFlag,
    minifyIdentifiers: minifyFlag,
    minifySyntax: minifyFlag,
    treeshake: true,
    format: ['esm', 'cjs'],
    target: 'es6',
    noExternal: ['merge-anything'],
    external: externals,
  },
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    banner: {
      js: '#!/usr/bin/env node',
    },
    clean: true,
    bundle: true,
    dts: false,
    minify: minifyFlag,
    minifyWhitespace: minifyFlag,
    minifyIdentifiers: minifyFlag,
    minifySyntax: minifyFlag,
    treeshake: true,
    format: ['cjs'],
    target: 'node16',
    noExternal: ['merge-anything'],
    external: externals,
  },
]);
