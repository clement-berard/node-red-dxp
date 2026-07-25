import { toMerged } from 'es-toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFolderIfNotExists, writeFile } from '../../../tools/node-utils';
import { getGlobalLocales } from '../globalLocales';
import { getScopedNodesLocales } from '../scopedNodesLocales';
import { writeAllLocales } from '../writeLocales';

vi.mock('../../../current-context', () => ({
  currentContext: {
    pathDist: '/proj/dist',
  },
}));

vi.mock('../../../tools/node-utils', () => ({
  createFolderIfNotExists: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('../globalLocales', () => ({
  getGlobalLocales: vi.fn(),
}));

vi.mock('../scopedNodesLocales', () => ({
  getScopedNodesLocales: vi.fn(),
}));

describe('writeAllLocales', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merges global and scoped locales and writes one file per language folder', async () => {
    vi.mocked(getGlobalLocales).mockResolvedValue('{"en-US":{"nodeA":{"hello":"Hello"}}}');
    vi.mocked(getScopedNodesLocales).mockResolvedValue('{"en-US":{"nodeB":{"foo":"Foo"}}}');

    await writeAllLocales();

    const expectedMerged = toMerged({ 'en-US': { nodeA: { hello: 'Hello' } } }, { 'en-US': { nodeB: { foo: 'Foo' } } });

    expect(createFolderIfNotExists).toHaveBeenCalledWith('/proj/dist/locales/en-US');
    expect(writeFile).toHaveBeenCalledWith(
      '/proj/dist/locales/en-US/index.json',
      JSON.stringify(expectedMerged['en-US']),
    );
  });

  it('characterizes toMerged behavior on same-key collisions between global and scoped', async () => {
    vi.mocked(getGlobalLocales).mockResolvedValue('{"en-US":{"nodeA":{"hello":"Hello global"}}}');
    vi.mocked(getScopedNodesLocales).mockResolvedValue('{"en-US":{"nodeA":{"hello":"Hello scoped"}}}');

    await writeAllLocales();

    const expectedMerged = toMerged(
      { 'en-US': { nodeA: { hello: 'Hello global' } } },
      { 'en-US': { nodeA: { hello: 'Hello scoped' } } },
    );

    expect(writeFile).toHaveBeenCalledWith(
      '/proj/dist/locales/en-US/index.json',
      JSON.stringify(expectedMerged['en-US']),
    );
  });

  it('resolves without throwing and writes nothing when both sources are empty', async () => {
    vi.mocked(getGlobalLocales).mockResolvedValue('{}');
    vi.mocked(getScopedNodesLocales).mockResolvedValue('{}');

    await expect(writeAllLocales()).resolves.toBeUndefined();

    expect(createFolderIfNotExists).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('creates all language folders before writing any file (folder creation is hoisted ahead of the writes)', async () => {
    vi.mocked(getGlobalLocales).mockResolvedValue(
      '{"en-US":{"nodeA":{"hello":"Hello"}},"fr":{"nodeA":{"hello":"Bonjour"}}}',
    );
    vi.mocked(getScopedNodesLocales).mockResolvedValue('{}');

    const order: string[] = [];
    vi.mocked(createFolderIfNotExists).mockImplementation((folderPath: string) => {
      const folderName = folderPath.split('/').pop() as string;
      order.push(`mkdir:${folderName}`);
    });
    vi.mocked(writeFile).mockImplementation(async (filePath: string) => {
      const folderName = filePath.split('/').slice(-2, -1)[0];
      order.push(`write:${folderName}`);
    });

    await writeAllLocales();

    for (const folderName of ['en-US', 'fr']) {
      expect(order.indexOf(`mkdir:${folderName}`)).toBeGreaterThanOrEqual(0);
      expect(order.indexOf(`write:${folderName}`)).toBeGreaterThanOrEqual(0);
    }

    const lastMkdirIndex = Math.max(order.indexOf('mkdir:en-US'), order.indexOf('mkdir:fr'));
    const firstWriteIndex = Math.min(order.indexOf('write:en-US'), order.indexOf('write:fr'));
    expect(lastMkdirIndex).toBeLessThan(firstWriteIndex);
  });
});
