import { existsSync } from 'node:fs';
import { join } from 'node:path';
import nodePlop from 'node-plop';
import { getLatestNpmPackageVersion } from '../../cli.utils';
import { registerActions } from './plop.actions';
import { getPackageManager } from './utils';

const DEV_MODE = process.env.DEV === 'true';
const PLOP_TEMPLATES_DIR = './create/plop-templates';

export async function handleCreatePackage(targetDir?: string) {
  const _CURRENT_DIR = targetDir || process.cwd();
  console.log('WIP COMMAND - DO NOT USE');
  console.log('Creating project in:', _CURRENT_DIR);

  const originalCwd = process.cwd();
  process.chdir(_CURRENT_DIR);

  try {
    const plop = await nodePlop();

    const templatesDir = join(__dirname, PLOP_TEMPLATES_DIR);

    if (!existsSync(templatesDir)) {
      throw new Error(`Templates directory not found: ${templatesDir}`);
    }

    const currentPackageManager = getPackageManager();
    const nrDXPLastVersion = await getLatestNpmPackageVersion('@keload/node-red-dxp');

    registerActions(plop);

    plop.setGenerator('project', {
      description: 'Generate a new Node.js project',
      prompts: DEV_MODE
        ? []
        : [
            {
              type: 'input',
              name: 'projectName',
              message: 'Node-Red project name:',
              default: '@my-scope/node-red-contrib-my-awesome-lib',
            },
            {
              type: 'input',
              name: 'description',
              message: 'Project description:',
              default: 'Awesome description',
            },
            {
              type: 'confirm',
              name: 'installDependencies',
              message: `Install dependencies with ${currentPackageManager}?`,
              default: true,
            },
          ],
      actions: (data) => {
        const answers = DEV_MODE
          ? {
              projectName: 'my-project-test',
              description: 'Test description',
              installDependencies: true,
            }
          : data;

        const actions: any[] = [
          ...['package.json', '.gitignore', 'biome.json', 'README.md', 'tsconfig.json', 'vitest.config.ts'].map(
            (fileName) => ({
              type: 'add',
              path: `${answers?.projectName}/${fileName}`,
              templateFile: join(templatesDir, `${fileName}.hbs`),
              data: { ...answers, nrDXPLastVersion },
            }),
          ),
        ];

        if (answers?.installDependencies) {
          actions.push({
            type: 'installDeps',
            projectName: answers.projectName,
          });
        }

        actions.push({
          type: 'createConfigNode',
          projectName: answers?.projectName,
        });

        actions.push({
          type: 'lint',
          projectName: answers?.projectName,
        });

        actions.push({
          type: 'onSuccess',
          projectName: answers?.projectName,
          currentPackageManager,
        });

        return actions;
      },
    });

    const generator = plop.getGenerator('project');
    const answers = await generator.runPrompts();
    const results = await generator.runActions(answers);

    if (results.failures.length > 0) {
      console.error('❌ Failures:', results.failures);
      process.exit(1);
    }

    console.log('✅ Project created successfully!');
    return results;
  } finally {
    process.chdir(originalCwd);
  }
}
