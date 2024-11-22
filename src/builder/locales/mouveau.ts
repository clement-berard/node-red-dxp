import fsPromise from 'node:fs/promises';
import { group } from 'radash';
import { currentContext } from '../../current-context';
import { writeFile } from '../../tools/node-utils';

async function getWithContent(path: string) {
  const codeLang = path.split('/').pop().split('.').shift();
  const content = await fsPromise.readFile(path, 'utf-8');

  return {
    codeLang,
    content,
  };
}

export async function someNew() {
  const nodesList = currentContext.listNodesFullNames;
  const srcLocales = currentContext.resolvedSrcLocalesPaths;
  const srcLocalesWithContent = await Promise.all(srcLocales.map(getWithContent));
  const srcLocales2 = nodesList.flatMap((nodeName) =>
    srcLocalesWithContent.map(({ codeLang, content }) => ({
      codeLang,
      content: `"${nodeName}":${content}`,
    })),
  );

  const grouped = group(srcLocales2, (l) => l.codeLang);

  let allContent = '';

  for (const [lang, locales] of Object.entries(grouped)) {
    const content = locales
      .map((l) => l.content)
      .join(',')
      .slice(0, -1);
    console.log('content', content);
    allContent += `"${lang}":{${content}},`;
  }

  console.log('toto2', allContent);

  await writeFile('toto.json', `{${allContent.slice(0, -1)}}`);
}
