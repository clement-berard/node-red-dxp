import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { writeFile } from '../../tools/node-utils';
import { handleDocs } from '../doc/getDocs';
import { getNodesHtml } from './html';
import { getResources } from './resources';
import { getAllCompiledStyles } from './styles';

async function getEditorIndexContent() {
  return `
import type { NodeAPI } from 'node-red';
${currentContext.listNodesFull.map((node) => `// @ts-ignore\nimport ${node.pascalName} from '${node.editor.tsPath}';`).join('\n')}

declare const RED: NodeAPI;

${currentContext.listNodesFull.map((node) => `// @ts-ignore\nwindow.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
`.trim();
}

async function getBuiltScript(minify = false) {
  const toInject = [];

  const result = await esbuild.build({
    entryPoints: [currentContext.cacheDirFiles.editorIndex],
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: 'es6',
    sourcemap: false,
    minify: minify,
    minifyWhitespace: minify,
    minifySyntax: minify,
    minifyIdentifiers: minify,
    legalComments: 'none',
    inject: toInject,
    write: false,
    loader: { '.ts': 'ts' },
  });

  if (result.outputFiles && result.outputFiles.length > 0) {
    return result.outputFiles[0].text;
  }
  return '';
}

type BuilderEditorParams = {
  minify?: boolean;
};

export class BuilderEditor {
  private params: BuilderEditorParams;

  constructor(params: BuilderEditorParams) {
    this.params = { minify: false, ...params };
  }

  async prepareEditorIndex() {
    const parts = [getBuiltScript(this.params.minify), handleDocs(), getResources()];

    const [js, docs, resources] = (await Promise.all(parts)) as [string, string, string];

    const html = await getNodesHtml({
      minify: this.params.minify,
      nodes: currentContext.listNodesFull,
      packageNameSlug: currentContext.packageNameSlug,
    });

    const css = await getAllCompiledStyles({
      rawHtml: html.html,
      minify: this.params.minify,
      nodes: currentContext.listNodesFull,
    });

    const wrappedJs = `<script type="application/javascript">${js.trim()}</script>`;
    const wrappedCss = `<style>${css}</style>`;

    return `
${resources}
${html.allWrappedHtml}
${wrappedCss}
${wrappedJs}
${docs}`.trim();
  }

  async getEditorTask() {
    return getEditorIndexContent().then((content) => {
      writeFile(`${currentContext.cacheDirFiles.editorIndex}`, content).then(() => {
        this.prepareEditorIndex().then(async (contentFinalIndexHtml) => {
          await writeFile(
            `${currentContext.pathDist}/${fixedConfig.nodes.editor.htmlName}.html`,
            contentFinalIndexHtml,
          );
        });
      });
    });
  }
}
