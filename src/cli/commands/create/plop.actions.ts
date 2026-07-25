import path from 'node:path';
import { consola } from 'consola';
import type { CustomActionFunction, NodePlopAPI } from 'plop';
import { runCommand } from '../../utils/run-command';
import { getPackageManager } from './utils';

const runPackageManagerCommand = async (
  projectName: string,
  command: string[],
  successMessage: string,
): Promise<string> => {
  if (!projectName) {
    throw new Error('projectName is required');
  }

  const projectPath = path.resolve(process.cwd(), projectName);
  const pm = getPackageManager();

  await runCommand(pm, command, { cwd: projectPath, stdio: 'inherit' });
  return `✓ ${successMessage}`;
};

export const installDepsAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  return runPackageManagerCommand(projectName, ['install'], 'Dependencies installed');
};

export const lintAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  await runPackageManagerCommand(projectName, ['biome', 'migrate', '--write'], 'Biome migration completed');

  return runPackageManagerCommand(projectName, ['lint:check', '--write'], 'Lint check completed');
};

export const createConfigNodeAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  return runPackageManagerCommand(
    projectName,
    ['node-red-dxp', 'create-node', '--name', 'my-config-node', '--config-node', '--skip-confirm'],
    'Config Node completed',
  );
};

export const createRegularNodeAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  return runPackageManagerCommand(
    projectName,
    ['node-red-dxp', 'create-node', '--name', 'my-node', '--regular-node', '--skip-confirm'],
    'Regular Node completed',
  );
};

export const onSuccessAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  const currentPackageManager = (config as any).currentPackageManager;
  consola.box(`cd ${projectName}\n${currentPackageManager} dev`);

  return '';
};

export function registerActions(plop: NodePlopAPI) {
  plop.setActionType('installDeps', installDepsAction);
  plop.setActionType('lint', lintAction);
  plop.setActionType('createConfigNode', createConfigNodeAction);
  plop.setActionType('createRegularNode', createRegularNodeAction);
  plop.setActionType('onSuccess', onSuccessAction);
}
