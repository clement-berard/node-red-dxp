import { sep } from 'node:path';
import { globSync } from 'fast-glob';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { readLocaleEntry } from './localeEntry';
import { groupAndSerializeLocales } from './serializeLocales';

async function processNode(path: string) {
  const cleanPath = path.replace(`${currentContext.pathSrcNodesDir}${sep}`, '');
  const [nodeName] = cleanPath.split(sep);
  const { codeLang, content } = await readLocaleEntry(path);

  return {
    key: nodeName,
    codeLang,
    content,
  };
}

export async function getScopedNodesLocales() {
  const matchedFiles = globSync(`${currentContext.pathSrcNodesDir}/**/${fixedConfig.localesDirName}/*.json`);
  const entries = await Promise.all(matchedFiles.map(processNode));

  return groupAndSerializeLocales(entries);
}
