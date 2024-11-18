import { readFileSync } from 'node:fs';
import { minify } from 'html-minifier-terser';
import { currentInstance } from '../current-instance';

export async function getNodeHtml(filePath: string) {
  const htmlContent = readFileSync(filePath, 'utf8');

  return minify(htmlContent, {
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

export async function getNodesHtml() {
  const nodes = currentInstance.getListNodesFull();

  const result = [];

  for (const node of nodes) {
    const html = await getNodeHtml(node.editor.htmlPath);
    result.push(wrapHtml(node.name, node.nodeIdentifier, currentInstance.packageNameSlug, html));
  }

  return result.join('').trim();
}
