import { Command } from 'commander';
import { runWatcher } from './watcher';

type CliOptions = {
  minify: boolean;
};

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('watch')
    .description('watch project')
    .option('--minify', 'Minify the output', false)
    .action((options: CliOptions) => {
      runWatcher({
        minify: options.minify,
      });
    });

  parentCommand.addCommand(cmd);
}
