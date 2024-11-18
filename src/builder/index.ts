import * as fs from 'node:fs';
import path from 'node:path';
import del from 'del';
import esbuild from 'esbuild';
import { currentInstance } from '../current-instance';
import { writeFinalDistIndexContent } from './final-index';
import { writeControllerIndex, writeEditorIndex } from './templates';
export { currentInstance } from '../current-instance';
export * from './templates';
export * from './styles';
export * from './html';
export * from './final-index';
export * from './doc';

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

export function cleanDist() {
  del.sync([currentInstance.pathDist]);
}
export function writeCacheConfigFile() {
  fs.writeFileSync(
    `${currentInstance.pathLibCacheDir}/config.json`,
    JSON.stringify(currentInstance.config, null, 2),
    'utf-8',
  );
}

function ensureDirectoryExists(dirPath: string): void {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

export async function buildAllPackage(minify = false) {
  ensureDirectoryExists(currentInstance.pathLibCacheDir);
  cleanDist();
  writeCacheConfigFile();
  writeControllerIndex();
  writeEditorIndex();
  await buildNodeController(minify);
  await writeFinalDistIndexContent(minify);
}
