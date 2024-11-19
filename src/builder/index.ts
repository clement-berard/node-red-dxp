import * as fs from 'node:fs';
import * as fsPromise from 'node:fs/promises';
import path from 'node:path';
import esbuild from 'esbuild';
import { currentInstance } from '../current-instance';
import { writeFinalDistIndexContent } from './final-index';
import { writeControllerIndex, writeEditorIndex } from './templates';
import { cleanPaths } from './utils';
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

export async function writeCacheConfigFile(): Promise<void> {
  try {
    await fsPromise.writeFile(
      `${currentInstance.pathLibCacheDir}/config.json`,
      JSON.stringify(currentInstance.config, null, 2),
      'utf-8',
    );
  } catch (error) {
    console.error('Error writing cache config file:', error);
  }
}

function ensureDirectoryExists(dirPath: string): void {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

export async function buildAllPackage(minify = false) {
  ensureDirectoryExists(currentInstance.pathLibCacheDir);
  await cleanPaths([currentInstance.pathDist]);

  await Promise.all([writeCacheConfigFile(), writeControllerIndex(), writeEditorIndex()]);

  await Promise.all([buildNodeController(minify), writeFinalDistIndexContent(minify)]);
}
