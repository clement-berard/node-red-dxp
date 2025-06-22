import { execSync } from 'node:child_process';
import { Command } from 'commander';
import { currentConfig, currentContext } from '../../../current-context';
import { resolveHomePath } from '../../utils';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('install-local-package')
    .description('Install this package into the current Node-RED local installation to develop on it')
    .action(() => {
      const pathToInstall = currentContext.currentDir;
      const packageName = resolveHomePath(currentConfig.watcher.nodeRed.path);

      try {
        execSync(`cd "${packageName}" && npm install "${pathToInstall}"`);
      } catch (e) {
        console.log('Error while installing package:', e);
      }
    });

  parentCommand.addCommand(cmd);
}
