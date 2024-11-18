import { Command } from 'commander';
import { currentInstance } from '../../../current-instance';

export function registerInfoCommands(parentCommand: Command) {
  const info = new Command('info').description('Command to get information');

  info
    .command('all')
    .description('Get information about the nodes')
    .action(() => {
      console.log('currentInstance', JSON.stringify(currentInstance, null, 2));
    });

  parentCommand.addCommand(info);
}
