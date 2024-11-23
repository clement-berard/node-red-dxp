import fs from 'node:fs';
import { consola } from 'consola';
import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { writeFile } from '../../tools/node-utils';
import { addCredentialsExportPlugin } from './esbuild';

type BuilderControllerParams = {
  minify?: boolean;
};

const targetPackageJsonFile = `${currentContext.currentDir}/package.json`;

export class BuilderController {
  private params: BuilderControllerParams;

  constructor(params: BuilderControllerParams) {
    this.params = { minify: false, ...params };
  }

  async getControllerIndexContent() {
    return `
import type { NodeAPI } from 'node-red';
${currentContext.listNodesFull.map((node) => `import ${node.pascalName}, {credentials as cred${node.pascalName}} from '${node.fullControllerPath}';`).join('\n')}


export default async (RED: NodeAPI): Promise<void> => {
    global.RED = RED;

    ${currentContext.listNodesFull
      .map(
        (node) => `// @ts-ignore\nglobal.RED.nodes.registerType('${node.name}', ${node.pascalName}, {
        credentials: cred${node.pascalName}
    });`,
      )
      .join('\n')}
};
`.trim();
  }

  buildScript() {
    const packageJson = fs.readFileSync(targetPackageJsonFile, 'utf8');
    const parsedPackageJson = JSON.parse(packageJson);
    const toIncludeInBundle = currentContext.config.builder.esbuildControllerOptions.includeInBundle;
    const targetPackageDependencies = Object.keys(parsedPackageJson.dependencies || {});
    const realExternals = targetPackageDependencies.filter((item) => !toIncludeInBundle.includes(item));
    const realInternals = targetPackageDependencies.filter((item) => toIncludeInBundle.includes(item));

    if (toIncludeInBundle.length) {
      consola.info(`Packages include in controller bundle: ${realInternals.join(', ')}`);
    }

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
      packages: 'bundle',
      plugins: [addCredentialsExportPlugin],
      external: realExternals,
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
