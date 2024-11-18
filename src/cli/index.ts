import * as process from 'node:process';

import { Command } from 'commander';
import { consola } from 'consola';
import { buildAllPackage } from '../builder';
import { registerChecksCommands } from './commands/checks';
import { registerInfoCommands } from './commands/info';
import { registerScaffoldingCommands } from './commands/scaffolding';
import { runWatcher } from './watcher';

const program = new Command();

program.name('cli').description('Une CLI exemple').version('1.0.0');

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
  .option('--name <name>', 'Nom de la personne à saluer')
  .action((options) => {
    runWatcher();
  });

registerChecksCommands(program);
registerInfoCommands(program);
registerScaffoldingCommands(program);

program.parse(process.argv);
