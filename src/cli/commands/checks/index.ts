import { Command } from 'commander';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('checks')
    .description('[WIP] Commands to check the some stuff')
    .command('nodes-structure')
    .description('[WIP] Verify the structure of the nodes')
    .action(() => {
      console.log('In construction');
    });

  parentCommand.addCommand(cmd);
}
