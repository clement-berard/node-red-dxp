import { defineConfig } from 'tsdown';

const minifyFlag = true;

const noExternals = ['merge-anything'];

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
    },
    dts: true,
    minify: minifyFlag,
    treeshake: true,
    sourcemap: !minifyFlag,
    format: ['esm', 'cjs'],
    target: 'es6',
    noExternal: [...noExternals, 'radash'],
    platform: 'browser',
    onSuccess: `${process.env.CI ? 'cat build.sh && ./build.sh' : '. build.sh'}`,
    fixedExtension: false,
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
    dts: false,
    minify: minifyFlag,
    sourcemap: !minifyFlag,
    treeshake: true,
    format: ['cjs'],
    target: 'node16',
    platform: 'node',
    noExternal: [...noExternals, 'ora'],
    fixedExtension: false,
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
