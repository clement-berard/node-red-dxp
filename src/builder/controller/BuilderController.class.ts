import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { writeFile } from '../../tools/node-utils';

type BuilderControllerParams = {
  minify?: boolean;
};

export class BuilderController {
  private params: BuilderControllerParams;

  constructor(params: BuilderControllerParams) {
    this.params = { minify: false, ...params };
  }

  async getControllerIndexContent() {
    return `
import type { NodeAPI } from 'node-red';
${currentContext.listNodesFull.map((node) => `import ${node.pascalName} from '${node.fullControllerPath}';`).join('\n')}


export default async (RED: NodeAPI): Promise<void> => {
    global.RED = RED;

    ${currentContext.listNodesFull.map((node) => `// @ts-ignore\nglobal.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
};
`.trim();
  }

  buildScript() {
    return esbuild.build({
      entryPoints: [currentContext.cacheDirFiles.controllerIndex],
      outfile: `${currentContext.pathDist}/index.js`,
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
      writeFile(`${currentContext.cacheDirFiles.controllerIndex}`, content).then(() => {
        this.buildScript();
      });
    });
  }
}
