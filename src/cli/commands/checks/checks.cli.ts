import { Command } from 'commander';
import { consola } from 'consola';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('checks')
    .description('[WIP] Commands to check the some stuff')
    .command('nodes-structure')
    .description('[WIP] Verify the structure of the nodes')
    .action(() => {
      consola.info('In construction');
    });

  parentCommand.addCommand(cmd);
}
