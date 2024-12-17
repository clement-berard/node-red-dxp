import { Command } from 'commander';
import { handleCreatePackage } from './run';

export function registerCreateCommands(parentCommand: Command) {
  const create = new Command('create').description('[WIP] Create new package').action(async () => {
    await handleCreatePackage();
  });

  parentCommand.addCommand(create);
}
