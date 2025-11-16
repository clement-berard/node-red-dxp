import fsPromise from 'node:fs/promises';
import { currentContext } from '../../current-context';

async function getWithContent(path: string) {
  // biome-ignore lint/style/noNonNullAssertion: OK
  const codeLang = path.split('/').pop()!.split('.').shift()!;
  const content = await fsPromise.readFile(path, 'utf-8');

  return {
    codeLang,
    content,
  };
}

export async function getGlobalLocales() {
  const nodesList = currentContext.listNodesFullNames;
  const srcLocales = currentContext.resolvedSrcLocalesPaths;
  const srcLocalesWithContent = await Promise.all(srcLocales.map(getWithContent));

  const grouped: Record<string, string[]> = {};

  nodesList.forEach((nodeName) => {
    for (const { codeLang, content } of srcLocalesWithContent) {
      if (!grouped[codeLang]) {
        grouped[codeLang] = [];
      }

      grouped[codeLang].push(`"${nodeName}":${content}`);
    }
  });

  const langEntries = Object.entries(grouped).map(([lang, locales]) => {
    const content = locales.join(',');
    return `"${lang}":{${content}}`;
  });

  return `{${langEntries.join(',')}}`;
}
