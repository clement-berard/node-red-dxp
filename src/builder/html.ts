import { readFileSync } from 'node:fs';
import { minify } from 'html-minifier-terser';
import type { ListNode, ListNodesFull } from '../current-instance';
import { cleanSpaces } from './utils';

export async function minifyHtml(content: string) {
  return minify(content, {
    collapseWhitespace: true,
    removeComments: true,
    removeRedundantAttributes: false,
    useShortDoctype: true,
    removeEmptyAttributes: false,
    minifyCSS: false,
    minifyJS: false,
  });
}

function wrapHtml(nodeName: string, html: string) {
  return `
    <script type="text/html" data-template-name="${nodeName}">
        ${html}
    </script>
`;
}

async function processNodeHtml(node: ListNode, packageNameSlug: string, minify = false) {
  const htmlContent = readFileSync(node.editor.htmlPath, 'utf8');
  const htmlContentWithAdditionalDiv = `
  <div class="${packageNameSlug}">
    <div class="${node.nodeIdentifier}">${htmlContent}</div>
  </div>
  `;
  const html = minify ? await minifyHtml(htmlContentWithAdditionalDiv) : htmlContentWithAdditionalDiv;
  const wrappedHtml = wrapHtml(node.name, html);

  return {
    nodeName: node.name,
    nodeIdentifier: node.nodeIdentifier,
    html,
    wrappedHtml,
  };
}

type GetNodesHtmlParams = {
  nodes: ListNodesFull;
  minify?: boolean;
  packageNameSlug: string;
};

export async function getNodesHtml(params: GetNodesHtmlParams) {
  const { nodes, minify = false } = params;

  const res = await Promise.all(nodes.map((node) => processNodeHtml(node, params.packageNameSlug, minify)));

  const allHtml = res
    .map((node) => node.html)
    .join('')
    .trim();

  return {
    html: allHtml,
    allWrappedHtml: res
      .map((node) => (minify ? cleanSpaces(node.wrappedHtml) : node.wrappedHtml))
      .join('')
      .trim(),
  };
}
