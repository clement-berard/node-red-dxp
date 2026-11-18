import { relative } from 'node:path';
import { Command, Option } from 'commander';
import { currentContext } from '../../../current-context';
import { computeNodeName } from '../../../tools/common-utils';
import { ask, canPrompt, intro, log, outro, runAction, select, text } from '../../ui';
import { createNode, getDefaultCategory, type NodeEditorKind, nodeExists } from './scaffolding';

type CliOptions = {
  name?: string;
  configNode?: boolean;
  regularNode?: boolean;
  editor?: NodeEditorKind;
  category?: string;
  color?: string;
  yes?: boolean;
  /** @deprecated alias of `--yes`. */
  skipConfirm?: boolean;
};

export type CreateNodeAnswers = {
  name: string;
  isConfigNode: boolean;
  editor: NodeEditorKind;
  category?: string;
  color?: string;
};

/** Valid node name: something that gives a non-empty folder name. */
export function validateNodeName(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return 'The name is required';
  }
  if (!computeNodeName(value).dashName) {
    return 'Use letters or digits';
  }
  return undefined;
}

/**
 * Completes the options given on the command line with prompts. Without a terminal (CI, pipe) or with `--yes`,
 * the missing answers take their default instead: a regular Svelte node.
 */
export async function resolveAnswers(
  options: CliOptions,
  nodesDir: string,
  packageName?: string,
): Promise<CreateNodeAnswers> {
  const interactive = canPrompt() && !options.yes && !options.skipConfirm;

  let name = options.name;
  if (name === undefined) {
    if (!interactive) {
      throw new Error('Missing node name: pass --name <name>');
    }
    name = await ask(
      text({
        message: 'Node name',
        placeholder: 'my-node',
        validate: (value) =>
          validateNodeName(value) ??
          (nodeExists(nodesDir, value ?? '') ? `Node ${computeNodeName(value).dashName} already exists` : undefined),
      }),
    );
  }
  const invalid = validateNodeName(name);
  if (invalid) {
    throw new Error(`Invalid node name "${name}": ${invalid}`);
  }

  let isConfigNode = !!options.configNode;
  if (!options.configNode && !options.regularNode && interactive) {
    isConfigNode =
      (await ask(
        select({
          message: 'Kind of node',
          options: [
            { value: 'regular', label: 'Regular node', hint: 'inputs, outputs, runs in the flows' },
            { value: 'config', label: 'Config node', hint: 'shared settings (server, account...)' },
          ],
          initialValue: 'regular',
        }),
      )) === 'config';
  }

  let editor = options.editor;
  if (!editor) {
    editor = interactive
      ? await ask(
          select<NodeEditorKind>({
            message: 'Editor',
            options: [
              { value: 'svelte', label: 'Svelte', hint: 'one .svelte file, reactive (recommended)' },
              { value: 'classic', label: 'Classic', hint: 'html/pug + typescript' },
            ],
            initialValue: 'svelte',
          }),
        )
      : 'svelte';
  }

  if (options.color !== undefined && !/^#[0-9a-fA-F]{3,8}$/.test(options.color)) {
    throw new Error(`Invalid color "${options.color}": use a hex color like #a6bbcf`);
  }

  // a config node has no place in the palette
  let category = options.category;
  if (!isConfigNode && category === undefined && interactive) {
    category = await ask(
      text({
        message: 'Palette category',
        placeholder: getDefaultCategory(nodesDir, packageName),
        defaultValue: getDefaultCategory(nodesDir, packageName),
      }),
    );
  }

  return { name, isConfigNode, editor, category, color: options.color };
}

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('create-node')
    .description('Create a new node')
    .option('--name <name>', 'Node name')
    .addOption(new Option('--config-node', 'Generate a config node').conflicts('regularNode'))
    .addOption(new Option('--regular-node', 'Generate a regular node'))
    .addOption(new Option('--editor <editor>', 'Kind of editor').choices(['svelte', 'classic']))
    .option('--color <hex>', 'Palette color of a regular node, e.g. #a6bbcf (default: the one of its category)')
    .option('--category <name>', 'Palette category of a regular node (default: the one of the other nodes)')
    .option('-y, --yes', 'Do not prompt: use the defaults for what is not given', false)
    .addOption(new Option('--skip-confirm', 'Alias of --yes').hideHelp())
    .action((options: CliOptions) =>
      runAction(async () => {
        const nodesDir = currentContext.pathSrcNodesDir;

        intro('node-red-dxp create-node');
        const answers = await resolveAnswers(options, nodesDir, currentContext.packageName);
        const { dashName } = computeNodeName(answers.name);

        const files = await createNode({ nodesDir, packageName: currentContext.packageName, ...answers });
        log.success(`Node ${dashName} created (${answers.editor}${answers.isConfigNode ? ', config' : ''})`);
        log.message(files.map((file) => relative(currentContext.currentDir, file.path)).join('\n'));
        outro('Run `build` or `dev` to try it');
      }),
    );

  parentCommand.addCommand(cmd);
}
