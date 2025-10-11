import fsPromise from 'node:fs/promises';
import { sep } from 'node:path';
import { globSync } from 'fast-glob';
import { currentContext } from '../../current-context';

import { fixedConfig } from '../../fixed-config';

async function processNode(path: string) {
  const cleanPath = path.replace(`${currentContext.pathSrcNodesDir}${sep}`, '');
  const [nodeName, , fileName] = cleanPath.split(sep);
  const [codeLang] = fileName.split('.');
  const content = await fsPromise.readFile(path, 'utf-8');

  return {
    nodeName,
    codeLang,
    path,
    content,
  };
}

export async function getScopedNodesLocales() {
  const toto = globSync(`${currentContext.pathSrcNodesDir}/**/${fixedConfig.localesDirName}/*.json`);
  const res = await Promise.all(toto.map(processNode));

  const grouped = {} as any;

  res.forEach(({ nodeName, codeLang, content }) => {
    if (!grouped[codeLang]) {
      grouped[codeLang] = [];
    }

    grouped[codeLang].push(`"${nodeName}":${content}`);
  });

  let allContent = '';

  for (const [lang, locales] of Object.entries(grouped)) {
    const content = locales
      // @ts-expect-error
      .map((innerContent: string) => innerContent)
      .join(',')
      .slice(0, -1);
    allContent += `"${lang}":{${content}},`;
  }
  return `{${allContent.slice(0, -1)}}`;
}
