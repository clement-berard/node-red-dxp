import { Command } from 'commander';
import prettyJson from 'prettyjson';
import { currentConfig, currentContext } from '../../../current-context';
import { log } from '../../ui';

type CliOptions = {
  config?: boolean;
};

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('info')
    .description('Get information about the package')
    .option('--config', 'Show relative configuration information')
    .action((options: CliOptions) => {
      if (options.config) {
        log.info('Configuration information:');
        console.log(prettyJson.render(currentConfig));
      } else {
        console.log(prettyJson.render(currentContext));
      }
    });

  parentCommand.addCommand(cmd);
}
