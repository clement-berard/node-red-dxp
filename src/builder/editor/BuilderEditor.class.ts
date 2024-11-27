import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { writeFile } from '../../tools/node-utils';
import { getMdDocs } from '../doc/BuildDoc.class';
import { getNodesHtml } from './html';
import { getAllCompiledStyles } from './styles';

type BuilderEditorParams = {
  minify?: boolean;
};

export class BuilderEditor {
  private params: BuilderEditorParams;

  constructor(params: BuilderEditorParams) {
    this.params = { minify: false, ...params };
  }

  async getEditorIndexContent() {
    return `
import type { NodeAPI } from 'node-red';
${currentContext.listNodesFull.map((node) => `import ${node.pascalName} from '${node.editor.tsPath}';`).join('\n')}

declare const RED: NodeAPI;

${currentContext.listNodesFull.map((node) => `// @ts-ignore\nwindow.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
`.trim();
  }

  async getBuiltScript() {
    const result = await esbuild.build({
      entryPoints: [currentContext.cacheDirFiles.editorIndex],
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
      inject: [`${currentContext.currentPackagedDistPath}/editor/dxpFormRow.ts`],
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
      nodes: currentContext.listNodesFull,
      packageNameSlug: currentContext.packageNameSlug,
    });
    const css = await getAllCompiledStyles({
      rawHtml: html.html,
      minify: this.params.minify,
      nodes: currentContext.listNodesFull,
    });

    const docs = await getMdDocs();

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
