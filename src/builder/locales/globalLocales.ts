import fsPromise from 'node:fs/promises';
import { currentContext } from '../../current-context';
import { groupAndSerializeLocales } from './serializeLocales';

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

  const entries = nodesList.flatMap((nodeName) =>
    srcLocalesWithContent.map(({ codeLang, content }) => ({ key: nodeName, codeLang, content })),
  );

  return groupAndSerializeLocales(entries);
}
