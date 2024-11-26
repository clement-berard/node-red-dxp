import { performance } from 'node:perf_hooks';
import * as process from 'node:process';
import { Command } from 'commander';
import ora from 'ora';
import packageJson from '../../package.json';
import { Builder } from '../builder';
import { currentContext } from '../current-context';
import { registerChecksCommands } from './commands/checks';
import { registerInfoCommands } from './commands/info';
import { registerScaffoldingCommands } from './commands/scaffolding';
import { runWatcher } from './watcher';

const program = new Command();

program.name('node-red-dxp').description('node-red-dxp CLI').version(packageJson.version);
program
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

program
  .command('watch')
  .description('watch project')
  .option('--minify', 'Minify the output', false)
  .action((options) => {
    runWatcher({
      minify: options.minify,
    });
  });

registerChecksCommands(program);
registerInfoCommands(program);
registerScaffoldingCommands(program);

program.parse(process.argv);
