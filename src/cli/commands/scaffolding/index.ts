import { Command } from 'commander';
import { consola } from 'consola';
import { dash } from 'radash';
import { CreateNodeScaffolding } from '../../../scaffolding/create-node';
import { createFolderIfNotExists } from '../../../tools/node-utils';

export function registerScaffoldingCommands(parentCommand: Command) {
  const scaffolding = new Command('create-node').description('Create new node').action(async () => {
    const userChoice = await consola.prompt('Enter node name:', {
      type: 'text',
    });

    const nodeName = dash(userChoice);

    const userIsOk = await consola.prompt(`This name is OK for you '${nodeName}'?`, {
      type: 'confirm',
    });

    if (!userIsOk) {
      consola.info('👌 OK. Exiting...');
      return;
    }

    const isConfigNode = await consola.prompt('Is this a config node?', {
      type: 'confirm',
    });

    const createNewNodeInstance = new CreateNodeScaffolding(nodeName, isConfigNode);

    if (createNewNodeInstance.distFolderExist()) {
      consola.error(`Node ${createNewNodeInstance.nodeDashName} already exists`);
      consola.info(`In ${createNewNodeInstance.newNodeDistPath}`);
      return;
    }

    createFolderIfNotExists(createNewNodeInstance.newNodeEditorDistPath);

    await createNewNodeInstance.writeNewNode();
  });

  parentCommand.addCommand(scaffolding);
}
