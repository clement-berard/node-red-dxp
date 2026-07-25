import fsPromise from 'node:fs/promises';
import esbuild from 'esbuild';
import { currentContext } from '../../current-context';
import { getEsbuildBaseOptions } from '../../tools/esbuildBaseOptions';
import { writeFile } from '../../tools/node-utils';
import { addCredentialsExportPlugin } from './esbuild';

type BuildControllerParams = {
  minify?: boolean;
};

const targetPackageJsonFile = `${currentContext.currentDir}/package.json`;

function getControllerIndexContent() {
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

async function buildControllerScript(minify: boolean, packageJsonPromise: Promise<string>) {
  const packageJson = await packageJsonPromise;
  const parsedPackageJson = JSON.parse(packageJson);
  const toIncludeInBundle = [...currentContext.config.builder.esbuildControllerOptions.includeInBundle];
  const realExternals = Object.keys(parsedPackageJson.dependencies || {}).filter(
    (item) => !toIncludeInBundle.includes(item),
  );

  return esbuild.build({
    ...getEsbuildBaseOptions({ minify }),
    entryPoints: [currentContext.cacheDirFiles.controllerIndex],
    outfile: `${currentContext.pathDist}/index.js`,
    platform: 'node',
    format: 'cjs',
    target: 'es2018',
    packages: 'bundle',
    plugins: [addCredentialsExportPlugin],
    external: realExternals,
  });
}

export async function buildController({ minify = false }: BuildControllerParams = {}) {
  const packageJsonPromise = fsPromise.readFile(targetPackageJsonFile, 'utf8');
  const content = getControllerIndexContent();
  await writeFile(currentContext.cacheDirFiles.controllerIndex, content);
  return buildControllerScript(minify, packageJsonPromise);
}
