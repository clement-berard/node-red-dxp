import { describe, expect, it } from 'vitest';
import { getProjectDirName, validatePackageName } from '../utils';

describe('validatePackageName', () => {
  it.each(['node-red-contrib-foo', '@scope/node-red-contrib-foo', 'a.b_c~d'])('accepts %s', (name) => {
    expect(validatePackageName(name)).toBeUndefined();
  });

  it.each(['', '  ', 'Upper', 'with space', '@scope/', '/x', 'a'.repeat(215)])('rejects "%s"', (name) => {
    expect(validatePackageName(name)).toBeDefined();
  });
});

describe('getProjectDirName', () => {
  it('drops the scope', () => {
    expect(getProjectDirName('@scope/node-red-contrib-foo')).toBe('node-red-contrib-foo');
    expect(getProjectDirName('plain')).toBe('plain');
  });
});
