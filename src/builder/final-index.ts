import * as fs from 'node:fs';
import { getNodesHtml } from './html';
import { buildNodeEditor, currentInstance, handleAllDoc } from './index';
import { getAllCompiledStyles } from './styles';
import { cleanSpaces } from './utils';

export async function buildFinalDistIndexContent(minify = true) {
  const html = await getNodesHtml();
  const js = await buildNodeEditor(minify);
  const css = getAllCompiledStyles();
  const docs = handleAllDoc();

  return `${minify ? cleanSpaces(html) : html}
<style>${css}</style>
<script type="application/javascript">
${js.trim()}
</script>
${docs}`;
}

export async function writeFinalDistIndexContent(minify = false) {
  const content = await buildFinalDistIndexContent(minify);
  fs.writeFileSync(`${currentInstance.pathDist}/index.html`, content);
}
