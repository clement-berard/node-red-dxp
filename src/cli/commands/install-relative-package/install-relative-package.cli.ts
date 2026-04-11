import { execSync } from 'node:child_process';
import { Command } from 'commander';
import { consola } from 'consola';
import { currentConfig, currentContext } from '../../../current-context';
import { resolveHomePath } from '../../cli.utils';

type InstallLocalPackageParams = {
  pathToInstall?: string;
  userDir?: string;
};

export function installLocalPackage(params?: InstallLocalPackageParams) {
  const pathToInstall = params?.pathToInstall ?? currentContext.currentDir;
  const userDir = params?.userDir ?? resolveHomePath(currentConfig.watcher.nodeRed.userDir);
  try {
    execSync(`cd "${userDir}" && npm install "${pathToInstall}"`);
    consola.success('Local package installed in Node-RED userDir');
  } catch (e) {
    consola.error('Error while installing local package:', e);
  }
}

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('install-local-package')
    .description('Install this package into the current Node-RED local installation to develop on it')
    .action(() => installLocalPackage());

  parentCommand.addCommand(cmd);
}
