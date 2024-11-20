import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { consola } from 'consola';
import Handlebars from 'handlebars';
import { currentInstance, getCurrentInstance } from '../../../current-instance';
import { renderTemplate } from '../../../scaffolding';
import { computeNodeName } from '../../../utils/common-utils';
import { createFolderIfNotExists, distributionPackagePath, writeFile } from '../../../utils/node-utils';

export function registerScaffoldingCommands(parentCommand: Command) {
  const scaffolding = new Command('create-node').description('[WIP] Create a new node').action(async () => {
    const currentInstance = getCurrentInstance();
    consola.warn('Command in construction - not working yet');
    // const userChoice = await consola.prompt('Enter node name:', {
    //   type: 'text',
    // });
    //
    // const nodeName = dash(userChoice);
    //
    // const userIsOk = await consola.prompt(`This name is OK for you '${nodeName}'?`, {
    //   type: 'confirm',
    // });
    const response = 'je suis un node nouveau';
    const { pascalName: nodePascalName, dashName: nodeName } = computeNodeName(response);

    const newNodePath = `${currentInstance.pathSrcNodesDir}/${nodeName}`;

    const folderAlreadyExists = fs.existsSync(newNodePath);

    if (folderAlreadyExists) {
      consola.error(`Node ${nodeName} already exists`);
      consola.info(`In ${newNodePath}`);
      return;
    }

    // all good here we go

    const scaffoldedDistHbs = `${distributionPackagePath}/scaffolding/create-node/hbs`;
    const newNodeEditorPath = `${newNodePath}/editor`;

    // createFolderIfNotExists(newNodeEditorPath);

    const toSend = [
      {
        finalPath: `${newNodePath}/index.ts`,
        templatePath: `${scaffoldedDistHbs}/controller.ts.hbs`,
        templateData: {
          nodePascalName,
          nodeName,
        },
      },
      {
        finalPath: `${newNodePath}/types.ts`,
        templatePath: `${scaffoldedDistHbs}/types.ts.hbs`,
        templateData: {
          nodePascalName,
          nodeName,
        },
      },
      {
        finalPath: `${newNodeEditorPath}/index.ts`,
        templatePath: `${scaffoldedDistHbs}/editor/index.ts.hbs`,
        templateData: {
          nodePascalName,
          nodeName,
        },
      },
      {
        finalPath: `${newNodeEditorPath}/styles.scss`,
        templatePath: `${scaffoldedDistHbs}/editor/styles.scss.hbs`,
        templateData: {},
      },
      {
        finalPath: `${newNodeEditorPath}/index.html`,
        templatePath: `${scaffoldedDistHbs}/editor/index.html.hbs`,
        templateData: {},
      },
    ];

    console.log('toSend', toSend);

    // const tt = await renderTemplate(scaffoldedDistHbsNodeController, {
    //   nodePascalName,
    // });
    // await writeFile(controllerPath, tt);
    //
    // console.log('controllerPath', tt);
  });

  parentCommand.addCommand(scaffolding);
}
