import fsPromise from 'node:fs/promises';
import { currentContext } from '../../current-context';

async function getWithContent(path: string) {
  const codeLang = path.split('/').pop().split('.').shift();
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

  const grouped = {} as any;

  nodesList.forEach((nodeName) => {
    for (const { codeLang, content } of srcLocalesWithContent) {
      if (!grouped[codeLang]) {
        grouped[codeLang] = [];
      }

      grouped[codeLang].push(`"${nodeName}":${content}`);
    }
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
