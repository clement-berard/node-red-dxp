import { type ListNodesFull, currentInstance } from '../current-instance';
import { handleAllDoc } from './doc';
import { buildNodeEditor } from './esbuild';
import { getNodesHtml } from './html';
import { getAllCompiledStyles } from './styles';
import { cleanSpaces } from './utils';

export async function buildFinalDistIndexContent(params?: WriteFinalDistIndexContentParams) {
  const { minify = false } = params || {};
  const html = await getNodesHtml({
    minify,
    nodes: params.nodes,
    packageNameSlug: currentInstance.packageNameSlug,
  });
  const js = await buildNodeEditor(minify);
  const css = getAllCompiledStyles();
  const docs = handleAllDoc();

  return `${html.allWrappedHtml}
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
