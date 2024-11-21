import { describe, expect, it } from 'vitest';
import { updateI18nAttributes } from '../i18n';

describe('updateI18nAttributes', () => {
  it('should prepend node name if key does not start with "node-red:"', () => {
    const input = `<span data-i18n="foo"></span>`;
    const output = `<span data-i18n="my_node.foo"></span>`;
    expect(updateI18nAttributes('my_node', input)).toBe(output);
  });

  it('should not modify keys that start with "node-red:"', () => {
    const input = `<span data-i18n="node-red:common.label"></span>`;
    const output = `<span data-i18n="node-red:common.label"></span>`;
    expect(updateI18nAttributes('my_node', input)).toBe(output);
  });

  it('should handle prefixes like [something]', () => {
    const input = `<span data-i18n="[something]foo"></span>`;
    const output = `<span data-i18n="[something]my_node.foo"></span>`;
    expect(updateI18nAttributes('my_node', input)).toBe(output);
  });

  it('should handle multiple keys separated by ";"', () => {
    const input = `<a href="#" data-i18n="[something]label.linkTitle;label.linkText"></a>`;
    const output = `<a href="#" data-i18n="[something]my_node.label.linkTitle;my_node.label.linkText"></a>`;
    expect(updateI18nAttributes('my_node', input)).toBe(output);
  });

  it('should handle mixed keys (some with "node-red:", some without)', () => {
    const input = `<a href="#" data-i18n="[something]node-red:common.label.linkTitle;[something-else]label.linkText"></a>`;
    const output = `<a href="#" data-i18n="[something]node-red:common.label.linkTitle;[something-else]my_node.label.linkText"></a>`;
    expect(updateI18nAttributes('my_node', input)).toBe(output);
  });

  it('should not modify keys starting with "node-red:" even with multiple keys', () => {
    const input = `<a href="#" data-i18n="[something]node-red:common.label.linkTitle;[something-else]node-red:status.label.linkText"></a>`;
    const output = `<a href="#" data-i18n="[something]node-red:common.label.linkTitle;[something-else]node-red:status.label.linkText"></a>`;
    expect(updateI18nAttributes('my_node', input)).toBe(output);
  });

  it('should handle empty input strings', () => {
    expect(updateI18nAttributes('my_node', '')).toBe('');
  });

  it('should handle multiple elements with data-i18n attributes', () => {
    const input = `
      <span data-i18n="foo"></span>
      <a href="#" data-i18n="[something]label.linkTitle;label.linkText"></a>
    `;
    const output = `
      <span data-i18n="my_node.foo"></span>
      <a href="#" data-i18n="[something]my_node.label.linkTitle;my_node.label.linkText"></a>
    `;
    expect(updateI18nAttributes('my_node', input)).toBe(output);
  });

  it('should handle missing nodeName gracefully', () => {
    const input = `<span data-i18n="foo"></span>`;
    const output = `<span data-i18n="foo"></span>`;
    expect(updateI18nAttributes('', input)).toBe(output);
  });

  it('should handle missing data-i18n attributes without error', () => {
    const input = '<div>No data-i18n here</div>';
    expect(updateI18nAttributes('my_node', input)).toBe(input);
  });
});
