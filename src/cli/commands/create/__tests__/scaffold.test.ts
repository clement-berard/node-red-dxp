import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isFolderAvailable, scaffoldProject } from '../scaffold';

describe('scaffoldProject', () => {
  let root: string;
  let dir: string;

  const options = () => ({
    dir,
    packageName: '@me/node-red-contrib-demo',
    description: 'A "quoted" demo',
    editor: 'svelte' as const,
    nodeName: 'hello',
    pm: 'pnpm',
    dxpSpec: '^9.9.9',
    ai: true,
  });

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'dxp-project-'));
    dir = join(root, 'demo');
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('writes a valid package.json that depends on dxp and exposes the build', async () => {
    await scaffoldProject(options());
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8'));

    expect(pkg.name).toBe('@me/node-red-contrib-demo');
    expect(pkg.description).toBe('A quoted demo');
    expect(pkg.devDependencies['@keload/node-red-dxp']).toBe('^9.9.9');
    expect(pkg.scripts.build).toBe('node-red-dxp build');
    expect(pkg['node-red'].nodes.all).toBe('dist/index.js');
  });

  it('writes the first node, the dotfiles and the AI instructions', async () => {
    const written = await scaffoldProject(options());

    expect(existsSync(join(dir, 'src/nodes/hello/hello.svelte'))).toBe(true);
    expect(existsSync(join(dir, '.gitignore'))).toBe(true);
    expect(existsSync(join(dir, '.node-red-dxprc.json'))).toBe(true);
    expect(readFileSync(join(dir, 'AGENTS.md'), 'utf-8')).toContain('node-red-dxp:start');
    expect(readFileSync(join(dir, 'CLAUDE.md'), 'utf-8')).toBe('@AGENTS.md\n');
    expect(written).toContain(join(dir, 'AGENTS.md'));
  });

  it('can skip the AI instructions and use the classic editor', async () => {
    await scaffoldProject({ ...options(), ai: false, editor: 'classic' });

    expect(existsSync(join(dir, 'AGENTS.md'))).toBe(false);
    expect(existsSync(join(dir, 'src/nodes/hello/editor/index.ts'))).toBe(true);
  });

  it('refuses a folder that is not empty', async () => {
    mkdirSync(dir);
    writeFileSync(join(dir, 'file.txt'), 'x');

    expect(isFolderAvailable(dir)).toBe(false);
    await expect(scaffoldProject(options())).rejects.toThrow('is not empty');
  });
});
