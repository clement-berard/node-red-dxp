import esbuild from 'esbuild';
import { currentInstance } from '../current-instance';

export async function buildNodeController(minify = false) {
  return esbuild.build({
    entryPoints: [currentInstance.cacheDirFiles.controllerIndex],
    outfile: `${currentInstance.pathDist}/index.js`,
    bundle: true,
    minify,
    minifyWhitespace: minify,
    minifyIdentifiers: minify,
    minifySyntax: minify,
    platform: 'node',
    format: 'cjs',
    target: 'es2018',
    loader: { '.ts': 'ts' },
    packages: 'external',
  });
}

export async function buildNodeEditor(minify = false) {
  const result = await esbuild.build({
    entryPoints: [currentInstance.cacheDirFiles.editorIndex],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: 'es6',
    sourcemap: false,
    minify: minify,
    minifyWhitespace: minify,
    minifySyntax: minify,
    minifyIdentifiers: minify,
    legalComments: 'none',

    write: false,
    loader: { '.ts': 'ts' },
  });

  if (result.outputFiles && result.outputFiles.length > 0) {
    return result.outputFiles[0].text;
  }
  return '';
}
