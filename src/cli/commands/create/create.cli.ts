import { relative, resolve } from 'node:path';
import { Command, Option } from 'commander';
import packageJson from '../../../../package.json';
import { computeNodeName } from '../../../tools/common-utils';
import { ask, canPrompt, confirm, intro, note, outro, runAction, select, text, withSpinner } from '../../ui';
import { getPackageManager, getPackageManagerBinary, getRunScriptCommand } from '../../utils/package-manager';
import { runCommand } from '../../utils/run-command';
import type { NodeEditorKind } from '../create-node/scaffolding';
import { isFolderAvailable, scaffoldProject } from './scaffold';
import { getProjectDirName, validatePackageName } from './utils';

type CliOptions = {
  description?: string;
  editor?: NodeEditorKind;
  node?: string;
  pm?: string;
  dxpVersion?: string;
  install: boolean;
  ai: boolean;
  yes: boolean;
};

const DEFAULTS = {
  packageName: 'node-red-contrib-my-awesome-lib',
  description: 'Awesome Node-RED nodes',
  node: 'my-node',
};

export default function commandHandler(parentCommand: Command) {
  const cmd = new Command('create')
    .description('Create a new Node-RED package')
    .argument('[name]', 'Package name, e.g. @scope/node-red-contrib-my-lib')
    .option('--description <text>', 'Package description')
    .addOption(new Option('--editor <editor>', 'Kind of editor of the first node').choices(['svelte', 'classic']))
    .option('--node <name>', 'Name of the first node')
    .option('--pm <name>', 'Package manager used to install (default: the one running the CLI)')
    .addOption(new Option('--dxp-version <spec>', 'Version spec of @keload/node-red-dxp in package.json').hideHelp())
    .option('--no-install', 'Do not install the dependencies')
    .option('--no-ai', 'Do not write the AI instructions (AGENTS.md, CLAUDE.md)')
    .option('-y, --yes', 'Do not prompt: use the defaults for what is not given', false)
    .action((nameArg: string | undefined, options: CliOptions) =>
      runAction(async () => {
        const interactive = canPrompt() && !options.yes;
        intro('node-red-dxp create');

        let packageName = nameArg;
        if (packageName === undefined) {
          packageName = interactive
            ? await ask(
                text({
                  message: 'Package name',
                  placeholder: DEFAULTS.packageName,
                  defaultValue: DEFAULTS.packageName,
                  validate: (value) => validatePackageName(value || DEFAULTS.packageName),
                }),
              )
            : DEFAULTS.packageName;
        }
        const invalid = validatePackageName(packageName);
        if (invalid) {
          throw new Error(`Invalid package name "${packageName}": ${invalid}`);
        }

        const dir = resolve(process.cwd(), getProjectDirName(packageName));
        if (!isFolderAvailable(dir)) {
          throw new Error(`The folder ${relative(process.cwd(), dir)} already exists and is not empty`);
        }

        const description =
          options.description ??
          (interactive
            ? await ask(
                text({ message: 'Description', placeholder: DEFAULTS.description, defaultValue: DEFAULTS.description }),
              )
            : DEFAULTS.description);

        const editor: NodeEditorKind =
          options.editor ??
          (interactive
            ? await ask(
                select<NodeEditorKind>({
                  message: 'Editor of the nodes',
                  options: [
                    { value: 'svelte', label: 'Svelte', hint: 'one .svelte file, reactive (recommended)' },
                    { value: 'classic', label: 'Classic', hint: 'html/pug + typescript' },
                  ],
                  initialValue: 'svelte',
                }),
              )
            : 'svelte');

        const nodeName =
          options.node ??
          (interactive
            ? await ask(
                text({
                  message: 'Name of the first node',
                  placeholder: DEFAULTS.node,
                  defaultValue: DEFAULTS.node,
                  validate: (value) =>
                    computeNodeName(value || DEFAULTS.node).dashName ? undefined : 'Use letters or digits',
                }),
              )
            : DEFAULTS.node);

        const ai =
          options.ai && interactive
            ? await ask(confirm({ message: 'Add instructions for AI coding agents (AGENTS.md)?', initialValue: true }))
            : options.ai;

        const pm = options.pm ?? getPackageManager();
        const install =
          options.install && interactive
            ? await ask(confirm({ message: `Install the dependencies with ${pm}?`, initialValue: true }))
            : options.install;

        await withSpinner('Creating the project', 'Project created', () =>
          scaffoldProject({
            dir,
            packageName,
            description,
            editor,
            nodeName,
            pm,
            dxpSpec: options.dxpVersion ?? `^${packageJson.version}`,
            ai,
          }),
        );

        if (install) {
          await withSpinner(`Installing the dependencies with ${pm}`, 'Dependencies installed', () =>
            runCommand(getPackageManagerBinary(pm), ['install'], { cwd: dir }),
          );
          const [buildBinary, buildArgs] = getRunScriptCommand(pm, 'build');
          await withSpinner('Building the package', 'Package builds', () =>
            runCommand(buildBinary, buildArgs, { cwd: dir }),
          );
        }

        const folder = relative(process.cwd(), dir);
        note(
          [
            `cd ${folder}`,
            ...(install ? [] : [`${pm} install`]),
            `${pm} run dev`,
            '',
            'Add a node: npx node-red-dxp create-node',
          ].join('\n'),
          'Next steps',
        );
        outro(`${packageName} is ready`);
      }),
    );

  parentCommand.addCommand(cmd);
}
