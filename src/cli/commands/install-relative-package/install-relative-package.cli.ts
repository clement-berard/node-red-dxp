import fs from 'node:fs/promises';
import { Command } from 'commander';
import { currentConfig, currentContext } from '../../../current-context';
import { resolveHomePath } from '../../cli.utils';
import { log, runAction, withSpinner } from '../../ui';
import { runCommand } from '../../utils/run-command';

type InstallLocalPackageParams = {
  pathToInstall?: string;
  userDir?: string;
};

export async function installLocalPackage(params?: InstallLocalPackageParams): Promise<void> {
  const pathToInstall = params?.pathToInstall ?? currentContext.currentDir;
  const userDir = params?.userDir ?? resolveHomePath(currentConfig.watcher.nodeRed.userDir);

  log.info(`Installing local package from ${pathToInstall}`);
  log.info(`Target Node-RED userDir: ${userDir}`);

  try {
    await fs.access(userDir);
  } catch {
    log.error(`Node-RED userDir does not exist: ${userDir} (run dev command to create it)`);
    return;
  }
  await withSpinner('Running npm install...', 'Local package installed in Node-RED userDir', () =>
    runCommand('npm', ['install', pathToInstall], { cwd: userDir }),
  );
}

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('install-local-package')
    .description('Install this package into the current Node-RED local installation to develop on it')
    .action(() => runAction(installLocalPackage));

  parentCommand.addCommand(cmd);
}
