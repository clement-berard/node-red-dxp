import fsPromise from 'node:fs/promises';
import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { writeFile } from '../../tools/node-utils';
import { addCredentialsExportPlugin } from './esbuild';

type BuilderControllerParams = {
  minify?: boolean;
};

const targetPackageJsonFile = `${currentContext.currentDir}/package.json`;

export class BuilderController {
  private readonly minify: boolean;

  constructor({ minify = false }: BuilderControllerParams = {}) {
    this.minify = minify;
  }

  async getControllerIndexContent() {
    return `
import type { NodeAPI } from 'node-red';
${currentContext.listNodesFull.map((node) => `// @ts-ignore\nimport ${node.pascalName}, {credentials as cred${node.pascalName}} from '${node.fullControllerPath}';`).join('\n')}
${currentContext.redServerPath.map((p) => `// @ts-ignore\nimport RedServer from '${p}';`).join('\n')}

export default async (RED: NodeAPI): Promise<void> => {
  global.RED = RED;

${currentContext.listNodesFull.map((node) => `  // @ts-ignore\n  global.RED.nodes.registerType('${node.name}', ${node.pascalName}, { credentials: cred${node.pascalName} });`).join('\n')}
${currentContext.redServerPath.length > 0 ? '  RedServer();' : ''}
};
`.trim();
  }

  async buildScript() {
    const packageJson = await fsPromise.readFile(targetPackageJsonFile, 'utf8');
    const parsedPackageJson = JSON.parse(packageJson);
    const toIncludeInBundle = [...currentContext.config.builder.esbuildControllerOptions.includeInBundle];
    const realExternals = Object.keys(parsedPackageJson.dependencies || {}).filter(
      (item) => !toIncludeInBundle.includes(item),
    );

    return esbuild.build({
      entryPoints: [currentContext.cacheDirFiles.controllerIndex],
      outfile: `${currentContext.pathDist}/index.js`,
      bundle: true,
      minify: this.minify,
      platform: 'node',
      format: 'cjs',
      target: 'es2018',
      loader: { '.ts': 'ts' },
      packages: 'bundle',
      plugins: [addCredentialsExportPlugin],
      external: realExternals,
    });
  }

  async getControllerTask() {
    const content = await this.getControllerIndexContent();
    await writeFile(currentContext.cacheDirFiles.controllerIndex, content);
    return this.buildScript();
  }
}
