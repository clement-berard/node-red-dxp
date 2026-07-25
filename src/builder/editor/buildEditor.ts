import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { writeFile } from '../../tools/node-utils';
import { getDocs } from './docs';
import { getNodesHtml } from './html';
import { getResources } from './resources';
import { getAllCompiledStyles } from './styles';

type BuildEditorParams = {
  minify?: boolean;
};

async function getEditorIndexContent(): Promise<string> {
  return `
import type { NodeAPI } from 'node-red';
${currentContext.listNodesFull.map((node) => `// @ts-ignore\nimport ${node.pascalName} from '${node.editor.tsPath}';`).join('\n')}

declare const RED: NodeAPI;

${currentContext.listNodesFull.map((node) => `// @ts-ignore\nwindow.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
`.trim();
}

async function getBuiltEditorScript(minify = false): Promise<string> {
  const result = await esbuild.build({
    entryPoints: [currentContext.cacheDirFiles.editorIndex],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: 'es6',
    sourcemap: false,
    minify,
    legalComments: 'none',
    write: false,
    loader: { '.ts': 'ts' },
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
    rawHtml: html.html,
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
  const content = await getEditorIndexContent();
  await writeFile(currentContext.cacheDirFiles.editorIndex, content);
  const contentFinalIndexHtml = await getEditorHtmlContent(minify);
  await writeFile(`${currentContext.pathDist}/${fixedConfig.nodes.editor.htmlName}.html`, contentFinalIndexHtml);
}
