import { readFileSync } from 'node:fs';
import { minify } from 'html-minifier-terser';
import type { ListNode, ListNodesFull } from '../current-instance';
import { extractCSSClasses } from './styles';

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

function wrapHtml(nodeName: string, nodeIdentifier: string, pkgNameSlug: string, html: string) {
  return `
    <script type="text/html" data-template-name="${nodeName}">
        <div class="${pkgNameSlug}">
            <div class="${nodeIdentifier}">${html}</div>
        </div>
    </script>
`;
}

async function processNodeHtml(node: ListNode, packageNameSlug: string, minify = false) {
  const htmlContent = readFileSync(node.editor.htmlPath, 'utf8');
  const html = minify ? await minifyHtml(htmlContent) : htmlContent;
  const wrappedHtml = wrapHtml(node.name, node.nodeIdentifier, packageNameSlug, html);

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

  const cssClasses = extractCSSClasses(allHtml);

  return {
    html: allHtml,
    cssClasses,
    allWrappedHtml: res
      .map((node) => node.wrappedHtml)
      .join('')
      .trim(),
  };
}
