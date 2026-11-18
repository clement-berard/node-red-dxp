import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import packageJson from '../../../package.json';
import { createProgram, resolveHomePath } from '../cli.utils';

vi.mock('node:os', () => ({
  homedir: vi.fn(),
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
