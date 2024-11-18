import { Command } from 'commander';
import { consola } from 'consola';
import prettyJson from 'prettyjson';
import { currentInstance } from '../../../current-instance';

export function registerInfoCommands(parentCommand: Command) {
  const info = new Command('info')
    .description('Command to get information')
    .description('Get information about the package')
    .action(() => {
      consola.log(prettyJson.render(currentInstance));
    });

  parentCommand.addCommand(info);
}
