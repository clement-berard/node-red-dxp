import { spawn } from 'node:child_process';
import path from 'node:path';
import { consola } from 'consola';
import type { CustomActionFunction, NodePlopAPI } from 'plop';
import { getPackageManager } from './utils';

const runCommand = (projectName: string, command: string[], successMessage: string): Promise<string> => {
  if (!projectName) {
    throw new Error('projectName is required');
  }

  const projectPath = path.resolve(process.cwd(), projectName);
  const pm = getPackageManager();

  return new Promise((resolve, reject) => {
    const process = spawn(pm, command, {
      cwd: projectPath,
      stdio: 'inherit',
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(`${pm} ${command.join(' ')} failed`);
      } else {
        resolve(`✓ ${successMessage}`);
      }
    });
  });
};

export const installDepsAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  return runCommand(projectName, ['install'], 'Dependencies installed');
};

export const lintAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  await runCommand(projectName, ['biome', 'migrate', '--write'], 'Biome migration completed');

  return runCommand(projectName, ['lint:check', '--write'], 'Lint check completed');
};

export const createConfigNodeAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  return runCommand(
    projectName,
    ['node-red-dxp', 'create-node', '--name', 'my-config-node', '--config-node', '--skip-confirm'],
    'Config Node completed',
  );
};

export const onSuccessAction: CustomActionFunction = async (_answers, config) => {
  const projectName = (config as any).projectName;
  const currentPackageManager = (config as any).currentPackageManager;
  consola.box(`cd ${projectName}\n${currentPackageManager} dev`);

  return undefined;
};

export function registerActions(plop: NodePlopAPI) {
  plop.setActionType('installDeps', installDepsAction);
  plop.setActionType('lint', lintAction);
  plop.setActionType('createConfigNode', createConfigNodeAction);
  plop.setActionType('onSuccess', onSuccessAction);
}
