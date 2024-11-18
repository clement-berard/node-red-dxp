import { Command } from 'commander';
export function registerChecksCommands(parentCommand: Command) {
  const checks = new Command('checks').description('[WIP] Commands to check the some stuff');

  checks
    .command('nodes-structure')
    .description('[WIP] Verify the structure of the nodes')
    .action(() => {
      console.log('In construction');
    });

  parentCommand.addCommand(checks);
}
