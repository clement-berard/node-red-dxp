import * as process from 'node:process';

import { Command } from 'commander';
import { consola } from 'consola';
import packageJson from '../../package.json';
import { buildAllPackage } from '../builder';
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
    consola.start('Building...');
    await buildAllPackage(true);
    consola.ready('Build completed');
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
