import fs from 'node:fs/promises';
import { Command } from 'commander';
import { consola } from 'consola';
import { currentConfig, currentContext } from '../../../current-context';
import { resolveHomePath } from '../../cli.utils';
import { runCommand } from '../../utils/run-command';

type InstallLocalPackageParams = {
  pathToInstall?: string;
  userDir?: string;
};

export async function installLocalPackage(params?: InstallLocalPackageParams): Promise<void> {
  const pathToInstall = params?.pathToInstall ?? currentContext.currentDir;
  const userDir = params?.userDir ?? resolveHomePath(currentConfig.watcher.nodeRed.userDir);

  consola.info(`Installing local package from ${pathToInstall}`);
  consola.info(`Target Node-RED userDir: ${userDir}`);

  try {
    await fs.access(userDir);
  } catch {
    consola.error(`Node-RED userDir does not exist: ${userDir} (run dev command to create it)`);
    return;
  }
  consola.start('Running npm install...');
  await runCommand('npm', ['install', pathToInstall], { cwd: userDir });

  consola.success('Local package installed in Node-RED userDir');
}

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('install-local-package')
    .description('Install this package into the current Node-RED local installation to develop on it')
    .action(async () => {
      try {
        await installLocalPackage();
      } catch (error) {
        consola.error('Error while installing local package:', error);
        process.exit(1);
      }
    });

  parentCommand.addCommand(cmd);
}
