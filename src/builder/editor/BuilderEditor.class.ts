import esbuild from 'esbuild';
import type { Context } from '../../Context';
import { writeFile } from '../../utils/node-utils';
import { BuildDoc } from '../doc/BuildDoc.class';
import { getNodesHtml } from './html';
import { getAllCompiledStyles } from './styles';

type BuilderEditorParams = {
  minify?: boolean;
  context: Context;
};

export class BuilderEditor {
  private params: BuilderEditorParams;
  readonly context: Context;

  constructor(params: BuilderEditorParams) {
    this.params = { minify: false, ...params };
    this.context = this.params.context;
  }

  async getEditorIndexContent() {
    return `
import type { NodeAPI } from 'node-red';
${this.context.listNodesFull.map((node) => `import ${node.pascalName} from '${node.editor.tsPath}';`).join('\n')}

declare const RED: NodeAPI;

${this.context.listNodesFull.map((node) => `// @ts-ignore\nwindow.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
`.trim();
  }

  async getBuiltScript() {
    const result = await esbuild.build({
      entryPoints: [this.context.current.cacheDirFiles.editorIndex],
      bundle: true,
      platform: 'browser',
      format: 'iife',
      target: 'es6',
      sourcemap: false,
      minify: this.params.minify,
      minifyWhitespace: this.params.minify,
      minifySyntax: this.params.minify,
      minifyIdentifiers: this.params.minify,
      legalComments: 'none',
      inject: [`${this.context.current.currentPackagedDistPath}/editor/global-solid.ts`],
      write: false,
      loader: { '.ts': 'ts' },
    });

    if (result.outputFiles && result.outputFiles.length > 0) {
      return result.outputFiles[0].text;
    }
    return '';
  }

  async prepareEditorIndex() {
    const js = await this.getBuiltScript();
    const html = await getNodesHtml({
      minify: this.params.minify,
      nodes: this.context.listNodesFull,
      packageNameSlug: this.context.current.packageNameSlug,
    });
    const css = await getAllCompiledStyles({
      rawHtml: html.html,
      minify: this.params.minify,
      nodes: this.context.listNodesFull,
    });

    const builderDoc = new BuildDoc({ context: this.context });
    const docs = builderDoc.getAllDocContent();

    const wrappedJs = `<script type="application/javascript">${js.trim()}</script>`;
    const wrappedCss = `<style>${css}</style>`;

    return `
${html.allWrappedHtml}
${wrappedCss}
${wrappedJs}
${docs}`.trim();
  }

  async getEditorTask() {
    return this.getEditorIndexContent().then((content) => {
      writeFile(`${this.context.current.cacheDirFiles.editorIndex}`, content).then(() => {
        this.prepareEditorIndex().then(async (contentFinalIndexHtml) => {
          await writeFile(
            `${this.context.current.pathDist}/${this.context.current.config.nodes.editor.htmlName}.html`,
            contentFinalIndexHtml,
          );
        });
      });
    });
  }
}
