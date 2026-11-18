import { describe, expect, it } from 'vitest';
import { getPackageManagerBinary, getRunScriptCommand } from '../package-manager';

describe('package manager helpers', () => {
  it('strips the version of an agent name', () => {
    expect(getPackageManagerBinary('yarn@berry')).toBe('yarn');
    expect(getPackageManagerBinary('pnpm')).toBe('pnpm');
  });

  it('uses `run` only where the package manager needs it', () => {
    expect(getRunScriptCommand('npm', 'build')).toEqual(['npm', ['run', 'build']]);
    expect(getRunScriptCommand('bun', 'build')).toEqual(['bun', ['run', 'build']]);
    expect(getRunScriptCommand('pnpm', 'build')).toEqual(['pnpm', ['build']]);
    expect(getRunScriptCommand('yarn@berry', 'build')).toEqual(['yarn', ['build']]);
  });
});
