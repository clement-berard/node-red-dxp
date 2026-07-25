import { toMerged } from 'es-toolkit';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { createFolderIfNotExists, writeFile } from '../../tools/node-utils';
import { getGlobalLocales } from './globalLocales';
import { getScopedNodesLocales } from './scopedNodesLocales';

export async function writeAllLocales() {
  const [globalLocales, scopedLocales] = await Promise.all([getGlobalLocales(), getScopedNodesLocales()]);

  const res = toMerged(JSON.parse(globalLocales), JSON.parse(scopedLocales)) as Record<string, unknown>;

  const localesBasePath = `${currentContext.pathDist}/${fixedConfig.localesDirName}`;
  const folderNames = Object.keys(res);

  for (const folderName of folderNames) {
    createFolderIfNotExists(`${localesBasePath}/${folderName}`);
  }

  await Promise.all(
    Object.entries(res).map(([folderName, locales]) =>
      writeFile(`${localesBasePath}/${folderName}/index.json`, JSON.stringify(locales)),
    ),
  );
}
