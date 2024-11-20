import { performance } from 'node:perf_hooks';
import * as process from 'node:process';
import { Command } from 'commander';
import { consola } from 'consola';
import packageJson from '../../package.json';
import { Builder } from '../builder/Builder.class';
import { registerChecksCommands } from './commands/checks';
import { registerInfoCommands } from './commands/info';
import { registerScaffoldingCommands } from './commands/scaffolding';
import { runWatcher } from './watcher';

const program = new Command();

program.name('node-red-dxp').description('node-red-dxp CLI').version(packageJson.version);

program
  .command('build')
  .description('Build project')
  .action(async (options) => {
    const start = performance.now();
    consola.start('Building...');
    const builder = new Builder({
      minify: true,
    });
    await builder.buildAll();
    const end = performance.now();
    const elapsed = end - start;
    const elapsedSeconds = elapsed > 1000 ? `${(elapsed / 1000).toFixed(2)}s` : `${elapsed.toFixed(2)}ms`;
    consola.ready(`Build completed in ${elapsedSeconds}`);
  });

program
  .command('watch')
  .description('watch project')
  .option('--minify <minify>', '[WIP] Minify the output', false)
  .action((options) => {
    runWatcher();
  });

registerChecksCommands(program);
registerInfoCommands(program);
registerScaffoldingCommands(program);

program.parse(process.argv);
