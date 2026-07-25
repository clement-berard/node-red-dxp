import { performance } from 'node:perf_hooks';
import { Command } from 'commander';
import { consola } from 'consola';
import ora from 'ora';
import { build } from '../../../builder';
import { currentContext } from '../../../current-context';

type CliOptions = {
  minify: boolean;
};

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('build')
    .description(
      'The build script compiles all nodes into a production-ready, optimized format at lightning speed, with the output defaulting to the dist directory.',
    )
    .option('--no-minify', 'No minify the output', true)
    .action(async (options: CliOptions) => {
      const nodesCount = currentContext.listNodesFull.length;
      const start = performance.now();
      consola.info('node-red-dxp builder');
      const spinner = ora(`Building ${nodesCount} node(s)...`).start();

      await build({
        minify: options.minify,
      });
      const end = performance.now();
      const elapsed = end - start;
      const elapsedSeconds = elapsed > 1000 ? `${(elapsed / 1000).toFixed(2)}s` : `${elapsed.toFixed(2)}ms`;
      spinner.succeed(`Build completed in ${elapsedSeconds} for ${nodesCount} nodes(s)`);
    });

  parentCommand.addCommand(cmd);
}
