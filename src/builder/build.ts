import fsPromise from 'node:fs/promises';
import { currentContext } from '../current-context';
import { cleanPaths, createFolderIfNotExists, writeFile } from '../tools/node-utils';
import { buildController } from './controller/buildController';
import { buildEditor } from './editor/buildEditor';
import { writeAllLocales } from './locales/writeLocales';

type BuildParams = {
  minify?: boolean;
};

async function prepare() {
  const { pathLibCacheDir, pathDist, currentPackagedDistPath, config } = currentContext;

  createFolderIfNotExists(pathLibCacheDir);

  await cleanPaths([pathDist]);

  await Promise.all([
    writeFile(`${pathLibCacheDir}/config.json`, JSON.stringify(config, null, 2)),
    fsPromise.copyFile(`${currentPackagedDistPath}/editor/assets/pug-helper.pug`, `${pathLibCacheDir}/pug-helper.pug`),
    fsPromise.cp(`${currentPackagedDistPath}/editor/assets/pug`, `${pathLibCacheDir}/pug`, { recursive: true }),
  ]);

  createFolderIfNotExists(pathDist);
}

export async function build({ minify = false }: BuildParams = {}) {
  await prepare();
  return Promise.all([buildController({ minify }), buildEditor({ minify }), writeAllLocales()]);
}
