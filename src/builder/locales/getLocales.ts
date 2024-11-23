import { merge } from 'merge-anything';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../default-config';
import { createFolderIfNotExists, writeFile } from '../../tools/node-utils';
import { getGlobalLocales } from './globalLocales';
import { getScopedNodesLocales } from './scopedNodeLocales';

export async function writeAllLocales() {
  const [globalLocales, scopedLocales] = await Promise.all([getGlobalLocales(), getScopedNodesLocales()]);

  const res = merge(JSON.parse(globalLocales), JSON.parse(scopedLocales));

  const toResolveCreateDirs = [];
  const toResolve = [];

  for (const [folderName, locales] of Object.entries(res)) {
    toResolveCreateDirs.push(
      createFolderIfNotExists(`${currentContext.pathDist}/${fixedConfig.localesDirName}/${folderName}`),
    );
    toResolve.push(
      writeFile(
        `${currentContext.pathDist}/${fixedConfig.localesDirName}/${folderName}/index.json`,
        JSON.stringify(locales),
      ),
    );
  }

  await Promise.all(toResolveCreateDirs);
  await Promise.all(toResolve);
}
