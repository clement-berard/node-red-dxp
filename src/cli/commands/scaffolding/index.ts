import { Command } from 'commander';
import { consola } from 'consola';
import { dash } from 'radash';

export function registerScaffoldingCommands(parentCommand: Command) {
  const scaffolding = new Command('create-node').description('[WIP] Create a new node').action(async () => {
    consola.warn('Command in construction - not working yet');
    const userChoice = await consola.prompt('Enter node name:', {
      type: 'text',
    });

    const nodeName = dash(userChoice);

    const userIsOk = await consola.prompt(`This name is OK for you '${nodeName}'?`, {
      type: 'confirm',
    });

    console.log('userIsOk', userIsOk);
  });

  parentCommand.addCommand(scaffolding);
}
