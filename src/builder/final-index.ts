import type { ListNodesFull } from '../current-instance';
import { handleAllDoc } from './doc';
import { buildNodeEditor } from './esbuild';
import { getNodesHtml } from './html';
import { getAllCompiledStyles } from './styles';
import { cleanSpaces } from './utils';

export async function buildFinalDistIndexContent(params?: WriteFinalDistIndexContentParams) {
  const { minify = false } = params || {};
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

type WriteFinalDistIndexContentParams = {
  minify?: boolean;
  nodes: ListNodesFull;
};
