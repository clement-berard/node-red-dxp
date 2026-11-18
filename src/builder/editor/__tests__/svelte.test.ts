import fsPromise from 'node:fs/promises';
import { glob } from 'fast-glob';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSveltePlugins, getSvelteSources } from '../svelte';

vi.mock('../../../current-context', () => ({
  currentContext: { currentPackagedDistPath: '/pkg/dist' },
}));

vi.mock('node:fs/promises', () => ({
  default: { readFile: vi.fn() },
}));

vi.mock('fast-glob', () => ({
  glob: vi.fn(),
}));

const svelteNode = { name: 'a', fullPath: '/proj/src/nodes/a', editor: { hasSvelte: true } } as any;
const classicNode = { name: 'b', fullPath: '/proj/src/nodes/b', editor: { hasSvelte: false } } as any;

describe('getSvelteSources', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty string, without reading anything, when no node is a svelte node', async () => {
    expect(await getSvelteSources([classicNode])).toBe('');
    expect(glob).not.toHaveBeenCalled();
    expect(fsPromise.readFile).not.toHaveBeenCalled();
  });

  it('joins the sources of the svelte nodes and of the dxp ui components', async () => {
    vi.mocked(glob).mockImplementation((async (_pattern: string, options: { cwd: string }) =>
      options.cwd === '/proj/src/nodes/a' ? ['/proj/src/nodes/a/a.svelte'] : ['/pkg/dist/ui/Row.svelte']) as any);
    vi.mocked(fsPromise.readFile).mockImplementation((async (file: string) => `src of ${file}`) as any);

    const result = await getSvelteSources([svelteNode, classicNode]);

    expect(result).toBe('src of /proj/src/nodes/a/a.svelte\nsrc of /pkg/dist/ui/Row.svelte');
  });

  it('globs relative to a cwd, so that windows paths cannot break the pattern', async () => {
    vi.mocked(glob).mockResolvedValue([] as any);

    await getSvelteSources([svelteNode]);

    expect(glob).toHaveBeenCalledWith('**/*.svelte', { cwd: '/proj/src/nodes/a', absolute: true });
    expect(glob).toHaveBeenCalledWith('*.svelte', { cwd: '/pkg/dist/ui', absolute: true });
  });
});

describe('getSveltePlugins', () => {
  it('returns the resolve plugin first, then the esbuild-svelte plugin', async () => {
    const plugins = await getSveltePlugins();

    expect(plugins.map((plugin) => plugin.name)).toEqual(['dxp-svelte-resolve', 'esbuild-svelte']);
  });
});
