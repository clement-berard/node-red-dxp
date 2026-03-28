import { merge } from 'es-toolkit';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { createFolderIfNotExists, writeFile } from '../../tools/node-utils';
import { getGlobalLocales } from './globalLocales';
import { getScopedNodesLocales } from './scopedNodeLocales';

export async function writeAllLocales() {
  const [globalLocales, scopedLocales] = await Promise.all([getGlobalLocales(), getScopedNodesLocales()]);

  const res = merge(JSON.parse(globalLocales), JSON.parse(scopedLocales));

  const localesBasePath = `${currentContext.pathDist}/${fixedConfig.localesDirName}`;

  await Promise.all(
    Object.entries(res).map(([folderName, locales]) => {
      createFolderIfNotExists(`${localesBasePath}/${folderName}`);
      return writeFile(`${localesBasePath}/${folderName}/index.json`, JSON.stringify(locales));
    }),
  );
}
