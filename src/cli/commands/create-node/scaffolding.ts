import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { computeNodeName } from '../../../tools/common-utils';
import { getCliAssetsDir } from '../../utils/paths';
import { renderTemplateFile } from '../../utils/render';

export type NodeEditorKind = 'svelte' | 'classic';

export type CreateNodeOptions = {
  /** `src/nodes` folder of the project. */
  nodesDir: string;
  /** Name given by the user, in any case: it is normalized (`My Node` -> `my-node`). */
  name: string;
  isConfigNode?: boolean;
  editor?: NodeEditorKind;
  /** Palette category of a regular node. Default: the one the other nodes use, else derived from the package name. */
  category?: string;
  /** Color of a regular node. Default: the one of the nodes of the same category, else derived from its name. */
  color?: string;
  /** Package name, to derive the default category. */
  packageName?: string;
};

export type NodeFile = { path: string; content: string };

function getTemplatePath(...parts: string[]): string {
  return join(getCliAssetsDir('templates'), 'node', ...parts);
}

const CATEGORY_REGEX = /category:\s*['"]([^'"]+)['"]/;
const COLOR_REGEX = /color:\s*['"](#[0-9a-fA-F]{3,8})['"]/;

/** Palette name from a package name: `@scope/node-red-contrib-my-lib` -> `my-lib`. */
export function categoryFromPackageName(packageName = ''): string {
  return (
    packageName
      .replace(/^@[^/]+\//, '')
      .replace(/^node-red-(contrib-)?/, '')
      .trim() || 'custom'
  );
}

type UsedStyle = { category: string; color?: string };

/** Category and color declared by each regular node of the package (config nodes are skipped). */
function listUsedStyles(nodesDir: string): UsedStyle[] {
  if (!existsSync(nodesDir)) {
    return [];
  }
  const styles: UsedStyle[] = [];
  for (const entry of readdirSync(nodesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const files = [
      join(nodesDir, entry.name, `${entry.name}.svelte`),
      join(nodesDir, entry.name, 'editor', 'index.ts'),
    ];
    const file = files.find((path) => existsSync(path));
    const source = file ? readFileSync(file, 'utf-8') : '';
    const category = source.match(CATEGORY_REGEX)?.[1];
    if (category && category !== 'config') {
      styles.push({ category, color: source.match(COLOR_REGEX)?.[1] });
    }
  }
  return styles;
}

/** Palette categories already used by the regular nodes of the package, most used first. */
export function listUsedCategories(nodesDir: string): string[] {
  const counts = new Map<string, number>();
  for (const { category } of listUsedStyles(nodesDir)) {
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category);
}

/** Category proposed for a new node: reuse the one of the package, else name it after the package. */
export function getDefaultCategory(nodesDir: string, packageName?: string): string {
  return listUsedCategories(nodesDir)[0] ?? categoryFromPackageName(packageName);
}

/** Soft color that is always the same for a given name (hash of the name -> hue). */
export function colorFromName(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  const hue = hash % 360;
  const [saturation, lightness] = [0.35, 0.65];
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    const value = lightness - (chroma / 2) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${channel(0)}${channel(8)}${channel(4)}`;
}

/** Color proposed for a new node: the one of the nodes of the same category, else a color from the category name. */
export function getDefaultColor(nodesDir: string, category: string): string {
  return (
    listUsedStyles(nodesDir).find((style) => style.category === category && style.color)?.color ??
    colorFromName(category)
  );
}

export function getNodeDir(nodesDir: string, name: string): string {
  return join(nodesDir, computeNodeName(name).dashName);
}

export function nodeExists(nodesDir: string, name: string): boolean {
  return existsSync(getNodeDir(nodesDir, name));
}

/** Renders the files of a new node in memory: path and content, nothing is written. */
export async function renderNodeFiles({
  nodesDir,
  name,
  isConfigNode = false,
  editor = 'svelte',
  category,
  color,
  packageName,
}: CreateNodeOptions): Promise<NodeFile[]> {
  const { dashName, pascalName } = computeNodeName(name);
  const nodeDir = getNodeDir(nodesDir, name);
  const resolvedCategory = category || getDefaultCategory(nodesDir, packageName);
  const data = {
    dashName,
    pascalName,
    category: resolvedCategory,
    color: color || getDefaultColor(nodesDir, resolvedCategory),
  };
  const suffix = isConfigNode ? '-config' : '';

  const files: { to: string; from: string }[] = [
    { to: 'controller.ts', from: getTemplatePath('shared', `controller${suffix}.ts.tpl`) },
    { to: 'types.ts', from: getTemplatePath('shared', `types${suffix}.ts.tpl`) },
    { to: 'docs.md', from: getTemplatePath('shared', 'docs.md.tpl') },
  ];

  if (editor === 'svelte') {
    files.push(
      { to: `${dashName}.svelte`, from: getTemplatePath('svelte', `node${suffix}.svelte.tpl`) },
      { to: 'locales/en-US.json', from: getTemplatePath('svelte', `en-US${suffix}.json.tpl`) },
    );
  } else {
    files.push(
      { to: 'editor/index.ts', from: getTemplatePath('classic', `index${suffix}.ts.tpl`) },
      { to: 'editor/index.html', from: getTemplatePath('classic', `index${suffix}.html.tpl`) },
      { to: 'editor/styles.scss', from: getTemplatePath('classic', 'styles.scss.tpl') },
    );
  }

  return Promise.all(
    files.map(async ({ to, from }) => ({ path: join(nodeDir, to), content: await renderTemplateFile(from, data) })),
  );
}

/** Creates the files of a new node. Throws when the node folder already exists. */
export async function createNode(options: CreateNodeOptions): Promise<NodeFile[]> {
  if (nodeExists(options.nodesDir, options.name)) {
    throw new Error(`Node ${computeNodeName(options.name).dashName} already exists in ${options.nodesDir}`);
  }
  const files = await renderNodeFiles(options);
  await Promise.all(
    files.map(async (file) => {
      await mkdir(dirname(file.path), { recursive: true });
      await writeFile(file.path, file.content);
    }),
  );
  return files;
}
