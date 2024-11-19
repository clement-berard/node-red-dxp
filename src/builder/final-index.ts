import { type ListNodesFull, currentInstance } from '../current-instance';
import { handleAllDoc } from './doc';
import { buildNodeEditor } from './esbuild';
import { getNodesHtml } from './html';
import { getAllCompiledStyles } from './styles';

export async function buildFinalDistIndexContent(params?: WriteFinalDistIndexContentParams) {
  const { minify = false } = params || {};
  const html = await getNodesHtml({
    minify,
    nodes: params.nodes,
    packageNameSlug: currentInstance.packageNameSlug,
  });
  const js = await buildNodeEditor(minify);
  const css = await getAllCompiledStyles({
    rawHtml: html.html,
    minify,
    nodes: params.nodes,
  });
  const docs = handleAllDoc();

  const wrappedJs = `<script type="application/javascript">${js.trim()}</script>`;
  const wrappedCss = `<style>${css}</style>`;

  return `
${html.allWrappedHtml}
${wrappedCss}
${wrappedJs}
${docs}`.trim();
}

type WriteFinalDistIndexContentParams = {
  minify?: boolean;
  nodes: ListNodesFull;
};
