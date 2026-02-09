import { Command, Option } from 'commander';
import { consola, type PromptOptions } from 'consola';
import { dash } from 'radash';
import { createFolderIfNotExists } from '../../../tools/node-utils';
import { CreateNodeScaffolding } from './scaffolding';

type CliOptions = {
  name?: string;
  skipConfirm?: boolean;
  configNode?: boolean;
  regularNode?: boolean;
};

async function promptIfNotExists<T>(mainValue: unknown | undefined, promptText: string, promptOptions: PromptOptions) {
  if (mainValue === undefined) {
    return consola.prompt(promptText, promptOptions) as Promise<T>;
  }

  return mainValue as T;
}

export default function commandHandler(parentCommand: Command) {
  const scaffolding = new Command('create-node')
    .description('Create new node')
    .option('--name <name>', 'Node name')
    .addOption(new Option('--config-node', 'Generate a config node').conflicts('regularNode'))
    .addOption(new Option('--regular-node', 'Generate a regular node'))
    .option('--skip-confirm', 'Skip confirmations', false);

  scaffolding.action(async (options: CliOptions) => {
    const inqName = await promptIfNotExists<string>(options.name, 'Enter node name:', {
      type: 'text',
    });

    const nodeName = dash(inqName);

    const userIsOkWithName =
      options?.skipConfirm ||
      (await consola.prompt(`This name is OK for you '${nodeName}'?`, {
        type: 'confirm',
      }));

    if (!userIsOkWithName) {
      consola.info('👌 OK. Exiting...');
      return;
    }

    const noNodeTypeInq = options?.configNode === undefined && options?.regularNode === undefined;
    let isConfigNode = false;
    if (noNodeTypeInq) {
      isConfigNode = await consola.prompt('Is this a config node?', {
        type: 'confirm',
      });
    } else if (options?.configNode) {
      isConfigNode = true;
    } else if (options?.regularNode) {
      isConfigNode = false;
    }

    const createNewNodeInstance = new CreateNodeScaffolding({
      innerNodeName: nodeName,
      isConfigNode,
    });

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
