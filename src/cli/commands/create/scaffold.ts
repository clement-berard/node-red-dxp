import { existsSync, readdirSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fixedConfig } from '../../../fixed-config';
import { getCliAssetsDir } from '../../utils/paths';
import { renderTemplateFile } from '../../utils/render';
import { writeAiInstructions } from '../ai/instructions';
import { createNode, type NodeEditorKind } from '../create-node/scaffolding';

export type ScaffoldProjectOptions = {
  /** Folder created for the project. */
  dir: string;
  packageName: string;
  description: string;
  editor: NodeEditorKind;
  /** Name of the first node. */
  nodeName: string;
  /** Package manager shown in the README. */
  pm: string;
  /** Version spec of `@keload/node-red-dxp` in the `devDependencies`. */
  dxpSpec: string;
  /** Write `AGENTS.md` and `CLAUDE.md` with the AI instructions of dxp. */
  ai: boolean;
};

const PROJECT_FILES: { from: string; to: string }[] = [
  { from: 'package.json.tpl', to: 'package.json' },
  { from: 'tsconfig.json.tpl', to: 'tsconfig.json' },
  { from: 'biome.json.tpl', to: 'biome.json' },
  { from: 'vitest.config.ts.tpl', to: 'vitest.config.ts' },
  { from: 'node-red-dxprc.json.tpl', to: '.node-red-dxprc.json' },
  { from: 'gitignore.tpl', to: '.gitignore' },
  { from: 'README.md.tpl', to: 'README.md' },
];

/** A folder that can receive a new project: missing or empty. */
export function isFolderAvailable(dir: string): boolean {
  return !existsSync(dir) || readdirSync(dir).length === 0;
}

/** Writes the whole project: config files, first node and, when asked, the AI instructions. Returns the written paths. */
export async function scaffoldProject(options: ScaffoldProjectOptions): Promise<string[]> {
  const { dir, packageName, description, editor, nodeName, pm, dxpSpec, ai } = options;
  if (!isFolderAvailable(dir)) {
    throw new Error(`The folder ${dir} is not empty`);
  }

  // `"` and `\` would break the JSON of package.json
  const data = { packageName, description: description.replace(/["\\]/g, ''), pm, dxpSpec };
  const templatesDir = join(getCliAssetsDir('templates'), 'project');
  const written: string[] = [];

  for (const { from, to } of PROJECT_FILES) {
    const target = join(dir, to);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, await renderTemplateFile(join(templatesDir, from), data));
    written.push(target);
  }

  const nodes = await createNode({
    nodesDir: join(dir, fixedConfig.srcDir, fixedConfig.nodesDirName),
    name: nodeName,
    editor,
    packageName,
  });
  written.push(...nodes.map((file) => file.path));

  if (ai) {
    await writeFile(join(dir, 'AGENTS.md'), await renderTemplateFile(join(templatesDir, 'AGENTS.md.tpl'), data));
    await writeAiInstructions(dir);
    written.push(join(dir, 'AGENTS.md'), join(dir, 'CLAUDE.md'));
  }

  return written;
}
