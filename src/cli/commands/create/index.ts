import { Command } from 'commander';
import { handleCreatePackage } from './run';

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('create').description('[WIP] Create new package').action(async () => {
    await handleCreatePackage();
  });

  parentCommand.addCommand(cmd);
}
