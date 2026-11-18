import { describe, expect, it } from 'vitest';
import { renderTemplate } from '../render';

describe('renderTemplate', () => {
  it('replaces every variable, with or without spaces inside the braces', () => {
    expect(renderTemplate('{{a}}-{{ b }}-{{a}}', { a: 'x', b: 2 })).toBe('x-2-x');
  });

  it('leaves single braces and code untouched', () => {
    expect(renderTemplate('const o = { a: {{a}} };', { a: 1 })).toBe('const o = { a: 1 };');
  });

  it('fails on an unknown variable instead of writing a broken file', () => {
    expect(() => renderTemplate('{{missing}}', {})).toThrow('Template variable "missing" is not provided');
  });
});
