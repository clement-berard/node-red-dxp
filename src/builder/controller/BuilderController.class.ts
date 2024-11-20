import esbuild from 'esbuild';
import type { Context } from '../../Context';
import { writeFile } from '../../utils/node-utils';

type BuilderControllerParams = {
  minify?: boolean;
  context: Context;
};

export class BuilderController {
  private params: BuilderControllerParams;
  private context: Context;

  constructor(params: BuilderControllerParams) {
    this.params = { minify: false, ...params };
    this.context = this.params.context;
  }

  async getControllerIndexContent() {
    return `
import type { NodeAPI } from 'node-red';
${this.context.listNodesFull.map((node) => `import ${node.pascalName} from '${node.fullControllerPath}';`).join('\n')}


export default async (RED: NodeAPI): Promise<void> => {
    global.RED = RED;

    ${this.context.listNodesFull.map((node) => `// @ts-ignore\nglobal.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
};
`.trim();
  }

  buildScript() {
    return esbuild.build({
      entryPoints: [this.context.current.cacheDirFiles.controllerIndex],
      outfile: `${this.context.current.pathDist}/index.js`,
      bundle: true,
      minify: this.params.minify,
      minifyWhitespace: this.params.minify,
      minifyIdentifiers: this.params.minify,
      minifySyntax: this.params.minify,
      platform: 'node',
      format: 'cjs',
      target: 'es2018',
      loader: { '.ts': 'ts' },
      packages: 'external',
    });
  }

  async getControllerTask() {
    return this.getControllerIndexContent().then((content) => {
      writeFile(`${this.context.current.cacheDirFiles.controllerIndex}`, content).then(() => {
        this.buildScript();
      });
    });
  }
}
