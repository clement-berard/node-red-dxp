import { performance } from 'node:perf_hooks';
import { Command } from 'commander';
import { build } from '../../../builder';
import { currentContext } from '../../../current-context';
import { intro, runAction, spinner } from '../../ui';

type CliOptions = {
  minify: boolean;
};

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('build')
    .description(
      'The build script compiles all nodes into a production-ready, optimized format at lightning speed, with the output defaulting to the dist directory.',
    )
    .option('--no-minify', 'No minify the output', true)
    .action((options: CliOptions) =>
      runAction(async () => {
        const nodesCount = currentContext.listNodesFull.length;
        const start = performance.now();
        intro('node-red-dxp builder');
        const spin = spinner();
        spin.start(`Building ${nodesCount} node(s)...`);

        try {
          await build({ minify: options.minify });
        } catch (error) {
          spin.error('Build failed');
          throw error;
        }

        const elapsed = performance.now() - start;
        const elapsedSeconds = elapsed > 1000 ? `${(elapsed / 1000).toFixed(2)}s` : `${elapsed.toFixed(2)}ms`;
        spin.stop(`Build completed in ${elapsedSeconds} for ${nodesCount} nodes(s)`);
      }),
    );

  parentCommand.addCommand(cmd);
}
