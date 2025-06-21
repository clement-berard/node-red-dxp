import { Command } from 'commander';
import { consola } from 'consola';
import prettyJson from 'prettyjson';
import { currentContext, currentConfig } from '../../../current-context';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('info')
    .description('Get information about the package')
    .option('--config', 'Show relative configuration information')
    .action((options) => {
      if (options.config) {
        consola.log('Configuration information:');
        consola.log(prettyJson.render(currentConfig));
      } else {
        consola.log(prettyJson.render(currentContext));
      }
    });

  parentCommand.addCommand(cmd);
}
