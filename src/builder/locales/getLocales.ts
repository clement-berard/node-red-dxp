import { merge } from 'merge-anything';
import { currentContext } from '../../current-context';
import { createFolderIfNotExists, writeFile } from '../../tools/node-utils';
import { getGlobalLocales } from './globalLocales';
import { getScopedNodesLocales } from './scopedNodeLocales';

export async function writeAllLocales() {
  const [globalLocales, scopedLocales] = await Promise.all([getGlobalLocales(), getScopedNodesLocales()]);

  const res = merge(JSON.parse(globalLocales), JSON.parse(scopedLocales));

  const toResolveCreateDirs = [];
  const toResolve = [];

  for (const [folderName, locales] of Object.entries(res)) {
    toResolveCreateDirs.push(createFolderIfNotExists(`${currentContext.pathDist}/locales/${folderName}`));
    toResolve.push(writeFile(`${currentContext.pathDist}/locales/${folderName}/index.json`, JSON.stringify(locales)));
  }

  await Promise.all(toResolveCreateDirs);
  await Promise.all(toResolve);
}
