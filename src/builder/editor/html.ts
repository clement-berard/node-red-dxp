import { readFileSync } from 'node:fs';
import { globSync } from 'fast-glob';
import { minify } from 'html-minifier-terser';
import pug from 'pug';
import type { ListNode, ListNodesFull } from '../../current-context';
import { cleanSpaces } from '../../tools/common-utils';
import { updateI18nAttributes } from './i18n';

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
  let htmlContent = '';

  const hasPug = globSync(node.editor.pugPath, { onlyFiles: true }).at(0);

  if (hasPug) {
    htmlContent = pug.renderFile(hasPug);
  } else {
    htmlContent = readFileSync(node.editor.htmlPath, 'utf8');
  }

  const htmlContentWithAdditionalDiv = `
  <div class="${packageNameSlug}">
    <div id="${node.nodeIdentifier}">${htmlContent}</div>
  </div>
  `;
  let html = minify ? await minifyHtml(htmlContentWithAdditionalDiv) : htmlContentWithAdditionalDiv;
  html = updateI18nAttributes(node.name, html);
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
