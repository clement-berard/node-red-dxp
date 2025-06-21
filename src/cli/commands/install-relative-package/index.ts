import { Command } from 'commander';
import { consola } from 'consola';
import prettyJson from 'prettyjson';
import { currentContext } from '../../../current-context';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('install-local-package')
    .description('Install this package into the current Node-RED local installation to develop on it')
    .action(() => {
      console.log('JE SUIS MOI MOEME');
    });

  parentCommand.addCommand(cmd);
}
