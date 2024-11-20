import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { consola } from 'consola';
import Handlebars from 'handlebars';
import { dash } from 'radash';
import { currentInstance, getCurrentInstance } from '../../../current-instance';
import { CreateNodeScaffolding, renderTemplate } from '../../../scaffolding';
import { computeNodeName } from '../../../utils/common-utils';
import { createFolderIfNotExists, distributionPackagePath, writeFile } from '../../../utils/node-utils';

export function registerScaffoldingCommands(parentCommand: Command) {
  const scaffolding = new Command('create-node').description('[WIP] Create a new node').action(async () => {
    const currentInstance = getCurrentInstance();
    consola.warn('Command in construction - not working yet');
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

    const createNewNodeInstance = new CreateNodeScaffolding(nodeName);

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
