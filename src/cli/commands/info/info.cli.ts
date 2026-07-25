import { Command } from 'commander';
import { consola } from 'consola';
import prettyJson from 'prettyjson';
import { currentConfig, currentContext } from '../../../current-context';

type CliOptions = {
  config?: boolean;
};

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('info')
    .description('Get information about the package')
    .option('--config', 'Show relative configuration information')
    .action((options: CliOptions) => {
      if (options.config) {
        consola.log('Configuration information:');
        consola.log(prettyJson.render(currentConfig));
      } else {
        consola.log(prettyJson.render(currentContext));
      }
    });

  parentCommand.addCommand(cmd);
}
