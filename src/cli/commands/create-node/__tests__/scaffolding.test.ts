import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  categoryFromPackageName,
  colorFromName,
  createNode,
  getDefaultCategory,
  getDefaultColor,
  getNodeDir,
  listUsedCategories,
  nodeExists,
  renderNodeFiles,
} from '../scaffolding';

describe('create-node scaffolding', () => {
  let nodesDir: string;

  beforeEach(() => {
    nodesDir = mkdtempSync(join(tmpdir(), 'dxp-nodes-'));
  });

  afterEach(() => {
    rmSync(nodesDir, { recursive: true, force: true });
  });

  const relativeFiles = async (options: Parameters<typeof renderNodeFiles>[0]) =>
    (await renderNodeFiles(options)).map((file) => relative(nodesDir, file.path)).sort();

  it('renders a svelte node by default', async () => {
    expect(await relativeFiles({ nodesDir, name: 'My Node' })).toEqual([
      'my-node/controller.ts',
      'my-node/docs.md',
      'my-node/locales/en-US.json',
      'my-node/my-node.svelte',
      'my-node/types.ts',
    ]);
  });

  it('renders a classic node with the editor folder', async () => {
    expect(await relativeFiles({ nodesDir, name: 'old', editor: 'classic' })).toEqual([
      'old/controller.ts',
      'old/docs.md',
      'old/editor/index.html',
      'old/editor/index.ts',
      'old/editor/styles.scss',
      'old/types.ts',
    ]);
  });

  it('renders the config variant with credentials', async () => {
    const files = await renderNodeFiles({ nodesDir, name: 'my-server', isConfigNode: true });
    const byName = Object.fromEntries(files.map((file) => [relative(nodesDir, file.path), file.content]));

    expect(byName['my-server/my-server.svelte']).toContain("category: 'config'");
    expect(byName['my-server/controller.ts']).toContain('export const credentials');
    expect(byName['my-server/types.ts']).toContain('host: string');
  });

  it('puts the names in the files and leaves no variable behind', async () => {
    const files = await renderNodeFiles({ nodesDir, name: 'hello world' });
    const svelte = files.find((file) => file.path.endsWith('.svelte'));

    expect(svelte?.content).toContain('NodeHelloWorldProps');
    expect(svelte?.content).toContain("'hello-world'");
    for (const file of files) {
      expect(file.content).not.toContain('{{');
    }
  });

  it('ids of the classic html follow the Node-RED convention', async () => {
    const regular = await renderNodeFiles({ nodesDir, name: 'a', editor: 'classic' });
    const config = await renderNodeFiles({ nodesDir, name: 'b', editor: 'classic', isConfigNode: true });

    expect(regular.find((file) => file.path.endsWith('.html'))?.content).toContain('id="node-input-name"');
    expect(config.find((file) => file.path.endsWith('.html'))?.content).toContain('id="node-config-input-name"');
  });

  it('writes the files, creating the folders', async () => {
    await createNode({ nodesDir, name: 'written' });

    expect(existsSync(join(getNodeDir(nodesDir, 'written'), 'locales', 'en-US.json'))).toBe(true);
    expect(readFileSync(join(nodesDir, 'written', 'controller.ts'), 'utf-8')).toContain('NodeWrittenProps');
  });

  it('refuses to overwrite an existing node', async () => {
    await createNode({ nodesDir, name: 'twice' });

    expect(nodeExists(nodesDir, 'Twice')).toBe(true);
    await expect(createNode({ nodesDir, name: 'twice' })).rejects.toThrow('Node twice already exists');
  });

  describe('category', () => {
    const svelteOf = async (options: Parameters<typeof renderNodeFiles>[0]) =>
      (await renderNodeFiles(options)).find((file) => file.path.endsWith('.svelte'))?.content;

    it('is derived from the package name', () => {
      expect(categoryFromPackageName('@me/node-red-contrib-ultimate-toolkit')).toBe('ultimate-toolkit');
      expect(categoryFromPackageName('node-red-foo')).toBe('foo');
      expect(categoryFromPackageName('plain')).toBe('plain');
      expect(categoryFromPackageName(undefined)).toBe('custom');
    });

    it('names a first node after the package', async () => {
      expect(await svelteOf({ nodesDir, name: 'a', packageName: '@me/node-red-contrib-demo' })).toContain(
        "category: 'demo'",
      );
    });

    it('reuses the category of the existing nodes, the most used first', async () => {
      await createNode({ nodesDir, name: 'one', category: 'shared' });
      await createNode({ nodesDir, name: 'two', category: 'shared', editor: 'classic' });
      await createNode({ nodesDir, name: 'three', category: 'rare' });
      await createNode({ nodesDir, name: 'cfg', isConfigNode: true });

      expect(listUsedCategories(nodesDir)).toEqual(['shared', 'rare']);
      expect(getDefaultCategory(nodesDir, '@me/node-red-contrib-demo')).toBe('shared');
      expect(await svelteOf({ nodesDir, name: 'four', packageName: 'x' })).toContain("category: 'shared'");
    });

    it('prefers an explicit category', async () => {
      expect(await svelteOf({ nodesDir, name: 'a', category: 'chosen', packageName: 'x' })).toContain(
        "category: 'chosen'",
      );
    });
  });
  describe('color', () => {
    const svelteOf = async (options: Parameters<typeof renderNodeFiles>[0]) =>
      (await renderNodeFiles(options)).find((file) => file.path.endsWith('.svelte'))?.content;

    it('is the same hex color for a given name, and differs between names', () => {
      expect(colorFromName('demo')).toMatch(/^#[0-9a-f]{6}$/);
      expect(colorFromName('demo')).toBe(colorFromName('demo'));
      expect(colorFromName('demo')).not.toBe(colorFromName('other'));
    });

    it('reuses the color of the nodes of the same category', async () => {
      await createNode({ nodesDir, name: 'one', category: 'shared', color: '#112233' });

      expect(getDefaultColor(nodesDir, 'shared')).toBe('#112233');
      expect(await svelteOf({ nodesDir, name: 'two', category: 'shared' })).toContain("color: '#112233'");
    });

    it('derives a color from a new category and honours an explicit one', async () => {
      expect(await svelteOf({ nodesDir, name: 'a', category: 'fresh' })).toContain(
        `color: '${colorFromName('fresh')}'`,
      );
      expect(await svelteOf({ nodesDir, name: 'b', category: 'fresh', color: '#abcdef' })).toContain(
        "color: '#abcdef'",
      );
    });
  });
});
