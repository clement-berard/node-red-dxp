import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { writeFile } from '../../tools/node-utils';
import { handleDocs } from '../doc/getDocs';
import { getNodesHtml } from './html';
import { getResources } from './resources';
import { getAllCompiledStyles } from './styles';

async function getEditorIndexContent(): Promise<string> {
  return `
import type { NodeAPI } from 'node-red';
${currentContext.listNodesFull.map((node) => `// @ts-ignore\nimport ${node.pascalName} from '${node.editor.tsPath}';`).join('\n')}

declare const RED: NodeAPI;

${currentContext.listNodesFull.map((node) => `// @ts-ignore\nwindow.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
`.trim();
}

async function getBuiltScript(minify = false): Promise<string> {
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

type BuilderEditorParams = {
  minify?: boolean;
};

export class BuilderEditor {
  private readonly minify: boolean;

  constructor({ minify = false }: BuilderEditorParams = {}) {
    this.minify = minify;
  }

  async prepareEditorIndex(): Promise<string> {
    const [js, docs, resources, html] = await Promise.all([
      getBuiltScript(this.minify),
      handleDocs(),
      getResources(),
      getNodesHtml({
        minify: this.minify,
        nodes: currentContext.listNodesFull,
        packageNameSlug: currentContext.packageNameSlug,
      }),
    ]);

    const css = await getAllCompiledStyles({
      rawHtml: html.html,
      minify: this.minify,
      nodes: currentContext.listNodesFull,
    });

    return `
${resources}
${html.allWrappedHtml}
<style>${css}</style>
<script type="application/javascript">${js.trim()}</script>
${docs}`.trim();
  }

  async getEditorTask(): Promise<void> {
    const content = await getEditorIndexContent();
    await writeFile(currentContext.cacheDirFiles.editorIndex, content);
    const contentFinalIndexHtml = await this.prepareEditorIndex();
    await writeFile(`${currentContext.pathDist}/${fixedConfig.nodes.editor.htmlName}.html`, contentFinalIndexHtml);
  }
}
