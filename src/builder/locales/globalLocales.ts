import { currentContext } from '../../current-context';
import { readLocaleEntry } from './localeEntry';
import { groupAndSerializeLocales } from './serializeLocales';

export async function getGlobalLocales() {
  const nodesList = currentContext.listNodesFullNames;
  const srcLocales = currentContext.resolvedSrcLocalesPaths;
  const srcLocalesWithContent = await Promise.all(srcLocales.map(readLocaleEntry));

  const entries = nodesList.flatMap((nodeName) =>
    srcLocalesWithContent.map(({ codeLang, content }) => ({ key: nodeName, codeLang, content })),
  );

  return groupAndSerializeLocales(entries);
}
