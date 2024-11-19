import fs from 'node:fs';
import path from 'node:path';
import { Command } from 'commander';
import { consola } from 'consola';
import Handlebars from 'handlebars';
import { dash, pascal } from 'radash';
import { currentInstance, getCurrentInstance } from '../../../current-instance';
import { renderTemplate } from '../../../scaffolding';

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
    // const response = 'set item';
    // const nodeName = dash(response);
    // const nodePascalName = pascal(response);
    //
    // const scaffoldedDistHbs = `${path.resolve(__dirname, '..')}/scaffolding/create-node/hbs`;
    // const scaffoldedDistHbsNodeController = `${scaffoldedDistHbs}/controller.ts.hbs`;
    //
    // const newNodePath = `${currentInstance.pathSrcNodesDir}/${nodeName}`;
    // const controllerPath = `${newNodePath}/index.ts`;
    //
    // console.log('scaffoldedDistHbsNodeController', scaffoldedDistHbsNodeController);
    //
    // const tt = await renderTemplate(scaffoldedDistHbsNodeController, {
    //   nodePascalName,
    // });
    // if (!fs.existsSync(newNodePath)) {
    //   fs.mkdirSync(newNodePath, { recursive: true });
    // }
    // fs.writeFileSync(controllerPath, tt, 'utf-8');
    // const template = handlebars.compile('Hello, {{name}}!');

    // console.log('controllerPath', tt);
  });

  parentCommand.addCommand(scaffolding);
}
