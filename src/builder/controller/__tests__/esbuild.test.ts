import { describe, expect, it, vi } from 'vitest';
import { addCredentialsExportPlugin } from '../esbuild';

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: mocks.readFile,
  },
}));

describe('addCredentialsExportPlugin', () => {
  function captureOnLoad() {
    let filter!: RegExp;
    let callback!: (args: { path: string }) => Promise<unknown>;
    const onLoad = vi.fn((options: { filter: RegExp }, cb: (args: { path: string }) => Promise<unknown>) => {
      filter = options.filter;
      callback = cb;
    });

    addCredentialsExportPlugin.setup({ onLoad } as never);

    return { filter, callback };
  }

  it('registers a filter matching files ending in controller.ts', () => {
    const { filter } = captureOnLoad();

    expect(filter.test('foo/controller.ts')).toBe(true);
    expect(filter.test('foo/other.ts')).toBe(false);
  });

  it('appends the credentials export when the source does not define one', async () => {
    const { callback } = captureOnLoad();
    mocks.readFile.mockResolvedValue('export default class Foo {}');

    const result = await callback({ path: '/some/controller.ts' });

    expect(mocks.readFile).toHaveBeenCalledWith('/some/controller.ts', 'utf8');
    expect(result).toEqual({
      contents: 'export default class Foo {}\nexport const credentials = {};',
      loader: 'ts',
    });
  });

  it('leaves the source unchanged when a credentials export already exists', async () => {
    const { callback } = captureOnLoad();
    const source = 'export const credentials = {};\nexport default class Foo {}';
    mocks.readFile.mockResolvedValue(source);

    const result = await callback({ path: '/some/controller.ts' });

    expect(result).toEqual({ contents: source, loader: 'ts' });
  });

  it('detects a credentials export without spaces and does not duplicate it', async () => {
    const { callback } = captureOnLoad();
    const source = 'export const credentials={foo:1};';
    mocks.readFile.mockResolvedValue(source);

    const result = await callback({ path: '/some/controller.ts' });

    expect(result).toEqual({ contents: source, loader: 'ts' });
  });
});
