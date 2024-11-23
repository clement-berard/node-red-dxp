import { defineConfig } from 'tsup';

const minifyFlag = false;

const noExternals = ['merge-anything', 'is-what'];

export default defineConfig([
  {
    entry: {
      'editor/index': 'src/editor/index.ts',
      index: 'src/index.ts',
      'utils/index': 'src/utils/index.ts',
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
    noExternal: [...noExternals, 'radash', 'is-ip'],
    platform: 'browser',
    onSuccess: '. build.sh',
  },
  // {
  //   entry: {
  //     'builder/index': 'src/builder/index.ts',
  //   },
  //   clean: true,
  //   bundle: true,
  //   dts: true,
  //   minify: minifyFlag,
  //   minifyWhitespace: minifyFlag,
  //   minifyIdentifiers: minifyFlag,
  //   minifySyntax: minifyFlag,
  //   sourcemap: !minifyFlag,
  //   treeshake: true,
  //   format: ['esm', 'cjs'],
  //   target: 'es6',
  //   noExternal: [...nodeExternals],
  //   external: externals,
  // },
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
    platform: 'node',
    noExternal: [...noExternals, 'ora'],
    external: [
      'esbuild',
      'fast-glob',
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
    ],
  },
]);
