import { Command } from 'commander';
import { consola } from 'consola';
import prettyJson from 'prettyjson';
import { currentContext } from '../../../current-context';

export function registerInfoCommands(parentCommand: Command) {
  const info = new Command('info')
    .description('Command to get information')
    .description('Get information about the package')
    .action(() => {
      consola.log(prettyJson.render(currentContext));
    });

  parentCommand.addCommand(info);
}
