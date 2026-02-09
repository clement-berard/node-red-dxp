import { performance } from 'node:perf_hooks';
import { Command } from 'commander';
import ora from 'ora';
import { Builder } from '../../../builder';
import { currentContext } from '../../../current-context';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('build')
    .command('build')
    .description(
      'The build script compiles all nodes into a production-ready, optimized format at lightning speed, with the output defaulting to the dist directory.',
    )
    .option('--no-minify', 'No minify the output', true)
    .action(async (options) => {
      const nodesCount = currentContext.listNodesFull.length;
      const start = performance.now();
      console.log('node-red-dxp builder');
      const spinner = ora(`Building ${nodesCount} node(s)...`).start();

      const builder = new Builder({
        minify: options.minify,
      });
      await builder.buildAll();
      const end = performance.now();
      const elapsed = end - start;
      const elapsedSeconds = elapsed > 1000 ? `${(elapsed / 1000).toFixed(2)}s` : `${elapsed.toFixed(2)}ms`;
      spinner.succeed(`Build completed in ${elapsedSeconds} for ${nodesCount} nodes(s)`);
    });

  parentCommand.addCommand(cmd);
}
