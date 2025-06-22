import { Command } from 'commander';
import { runWatcher } from './watcher';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('watch')
    .command('watch')
    .description('watch project')
    .option('--minify', 'Minify the output', false)
    .action((options) => {
      runWatcher({
        minify: options.minify,
      });
    });

  parentCommand.addCommand(cmd);
}
