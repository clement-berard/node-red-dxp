import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { consola } from 'consola';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import packageJson from '../../../package.json';
import { createProgram, getLatestNpmPackageVersion, resolveHomePath } from '../cli.utils';

vi.mock('node:os', () => ({
  homedir: vi.fn(),
}));

vi.mock('consola', () => ({
  consola: {
    error: vi.fn(),
  },
}));

describe('createProgram', () => {
  it('builds a commander program with the package name, given description and version', () => {
    const program = createProgram('My CLI description');

    expect(program.name()).toBe('node-red-dxp');
    expect(program.description()).toBe('My CLI description');
    expect(program.version()).toBe(packageJson.version);
  });
});

describe('resolveHomePath', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(homedir).mockReturnValue('/home/user');
  });

  it('expands a leading ~ to the home directory', () => {
    expect(resolveHomePath('~/some/dir')).toBe('/home/user/some/dir');
  });

  it('resolves a non ~ path relative to cwd', () => {
    expect(resolveHomePath('some/dir')).toBe(resolve('some/dir'));
  });
});

describe('getLatestNpmPackageVersion', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns the version from the npm registry response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ version: '1.2.3' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const version = await getLatestNpmPackageVersion('some-package');

    expect(version).toBe('1.2.3');
    expect(mockFetch).toHaveBeenCalledWith('https://registry.npmjs.org/some-package/latest');
  });

  it('throws and logs when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await expect(getLatestNpmPackageVersion('missing-package')).rejects.toThrow('Package missing-package not found');
    expect(consola.error).toHaveBeenCalled();
  });

  it('throws and logs when fetch rejects', async () => {
    const networkError = new Error('network down');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError));

    await expect(getLatestNpmPackageVersion('some-package')).rejects.toBe(networkError);
    expect(consola.error).toHaveBeenCalledWith('Error fetching version for some-package:', networkError);
  });
});
