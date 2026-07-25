import fsPromise from 'node:fs/promises';
import path from 'node:path';
import { globSync } from 'fast-glob';
import { describe, expect, it, vi } from 'vitest';
import { fixedConfig } from '../../../fixed-config';
import { getScopedNodesLocales } from '../scopedNodesLocales';
import { groupAndSerializeLocales } from '../serializeLocales';

const pathSrcNodesDir = '/proj/src/nodes';

vi.mock('../../../current-context', () => ({
  currentContext: {
    pathSrcNodesDir: '/proj/src/nodes',
  },
}));

vi.mock('fast-glob', () => ({
  globSync: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

describe('getScopedNodesLocales', () => {
  it('derives key/codeLang from a single matched file path', async () => {
    const filePath = `${pathSrcNodesDir}${path.sep}node-a${path.sep}locales${path.sep}en-US.json`;
    vi.mocked(globSync).mockReturnValue([filePath] as any);
    vi.mocked(fsPromise.readFile).mockResolvedValue('{"hello":"Hello"}' as any);

    const result = await getScopedNodesLocales();

    const expectedEntries = [{ key: 'node-a', codeLang: 'en-US', content: '{"hello":"Hello"}' }];

    expect(result).toBe(groupAndSerializeLocales(expectedEntries));
  });

  it('groups multiple nodes / multiple langs correctly', async () => {
    const fileA = `${pathSrcNodesDir}${path.sep}node-a${path.sep}locales${path.sep}en-US.json`;
    const fileB = `${pathSrcNodesDir}${path.sep}node-a${path.sep}locales${path.sep}fr.json`;
    const fileC = `${pathSrcNodesDir}${path.sep}node-b${path.sep}locales${path.sep}en-US.json`;

    vi.mocked(globSync).mockReturnValue([fileA, fileB, fileC] as any);
    vi.mocked(fsPromise.readFile).mockImplementation(async (filePath) => {
      if (filePath === fileA) return '{"hello":"Hello"}';
      if (filePath === fileB) return '{"hello":"Bonjour"}';
      if (filePath === fileC) return '{"bye":"Bye"}';
      throw new Error(`unexpected path ${filePath}`);
    });

    const result = await getScopedNodesLocales();

    const expectedEntries = [
      { key: 'node-a', codeLang: 'en-US', content: '{"hello":"Hello"}' },
      { key: 'node-a', codeLang: 'fr', content: '{"hello":"Bonjour"}' },
      { key: 'node-b', codeLang: 'en-US', content: '{"bye":"Bye"}' },
    ];

    expect(result).toBe(groupAndSerializeLocales(expectedEntries));
  });

  it('returns "{}" when globSync finds no files', async () => {
    vi.mocked(globSync).mockReturnValue([] as any);

    const result = await getScopedNodesLocales();

    expect(result).toBe('{}');
  });

  it('calls globSync with the expected glob pattern built from fixedConfig.localesDirName', async () => {
    vi.mocked(globSync).mockReturnValue([] as any);

    await getScopedNodesLocales();

    expect(globSync).toHaveBeenCalledWith(`${pathSrcNodesDir}/**/${fixedConfig.localesDirName}/*.json`);
  });
});
