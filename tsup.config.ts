import { defineConfig } from 'tsup';

const minifyFlag = true;

const externals = [
  'esbuild',
  'glob',
  'sass',
  'html-minifier-terser',
  'chokidar',
  'consola',
  'nodemon',
  'tailwindcss',
  'postcss',
  'cssnano',
  '@fullhuman/postcss-purgecss',
  'autoprefixer',
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
    sourcemap: !minifyFlag,
    format: ['esm', 'cjs'],
    target: 'es6',
    noExternal: ['merge-anything'],
    external: externals,
    onSuccess: '. build.sh',
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
    sourcemap: !minifyFlag,
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
    sourcemap: !minifyFlag,
    treeshake: true,
    format: ['cjs'],
    target: 'node16',
    noExternal: ['merge-anything'],
    external: externals,
  },
]);
