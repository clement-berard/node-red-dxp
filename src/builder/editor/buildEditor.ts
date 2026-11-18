import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { getEsbuildBaseOptions } from '../../tools/esbuildBaseOptions';
import { writeFile } from '../../tools/node-utils';
import { getDocs } from './docs';
import { getNodesHtml } from './html';
import { getResources } from './resources';
import { getAllCompiledStyles } from './styles';
import { getSveltePlugins, getSvelteSources } from './svelte';

type BuildEditorParams = {
  minify?: boolean;
};

function getEditorIndexContent(): string {
  const nodes = currentContext.listNodesFull;
  const hasSvelte = nodes.some((node) => node.editor.hasSvelte);
  return `
import type { NodeAPI } from 'node-red';
${hasSvelte ? "import { defineSvelteNode } from '@keload/node-red-dxp/editor/svelte';\nimport SvelteRoot from '@keload/node-red-dxp/editor/svelte/Root.svelte';" : ''}
${nodes.map((node) => (node.editor.hasSvelte ? `// @ts-ignore\nimport * as ${node.pascalName} from '${node.editor.sveltePath}';` : `// @ts-ignore\nimport ${node.pascalName} from '${node.editor.tsPath}';`)).join('\n')}

declare const RED: NodeAPI;

${nodes.map((node) => `// @ts-ignore\nwindow.RED.nodes.registerType('${node.name}', ${node.editor.hasSvelte ? `defineSvelteNode({ name: '${node.name}', identifier: '${node.nodeIdentifier}', root: SvelteRoot, module: ${node.pascalName} })` : node.pascalName});`).join('\n')}
`.trim();
}

async function getBuiltEditorScript(minify = false): Promise<string> {
  const result = await esbuild.build({
    ...getEsbuildBaseOptions({ minify }),
    entryPoints: [currentContext.cacheDirFiles.editorIndex],
    plugins: currentContext.listNodesFull.some((node) => node.editor.hasSvelte) ? await getSveltePlugins() : [],
    platform: 'browser',
    format: 'iife',
    target: 'es6',
    sourcemap: false,
    legalComments: 'none',
    write: false,
  });

  return result.outputFiles?.[0]?.text ?? '';
}

async function getEditorHtmlContent(minify: boolean): Promise<string> {
  const [js, docs, resources, html] = await Promise.all([
    getBuiltEditorScript(minify),
    getDocs(),
    getResources(),
    getNodesHtml({
      minify,
      nodes: currentContext.listNodesFull,
      packageNameSlug: currentContext.packageNameSlug,
    }),
  ]);

  const css = await getAllCompiledStyles({
    rawHtml: [html.html, await getSvelteSources(currentContext.listNodesFull)].filter(Boolean).join('\n'),
    minify,
    nodes: currentContext.listNodesFull,
  });

  return `
${resources}
${html.allWrappedHtml}
<style>${css}</style>
<script type="application/javascript">${js.trim()}</script>
${docs}`.trim();
}

export async function buildEditor({ minify = false }: BuildEditorParams = {}): Promise<void> {
  const content = getEditorIndexContent();
  await writeFile(currentContext.cacheDirFiles.editorIndex, content);
  const contentFinalIndexHtml = await getEditorHtmlContent(minify);
  await writeFile(`${currentContext.pathDist}/${fixedConfig.nodes.editor.htmlName}.html`, contentFinalIndexHtml);
}
