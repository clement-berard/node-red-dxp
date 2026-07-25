import { describe, expect, it } from 'vitest';
import { groupAndSerializeLocales } from '../serializeLocales';

describe('groupAndSerializeLocales', () => {
  it('returns an empty object string for an empty entries array', () => {
    expect(groupAndSerializeLocales([])).toBe('{}');
  });

  it('serializes a single entry', () => {
    const result = groupAndSerializeLocales([{ key: 'nodeA', codeLang: 'en-US', content: '{"hello":"Hello"}' }]);

    expect(result).toBe('{"en-US":{"nodeA":{"hello":"Hello"}}}');
  });

  it('merges two entries with the same codeLang under one lang object, in insertion order', () => {
    const result = groupAndSerializeLocales([
      { key: 'nodeA', codeLang: 'en-US', content: '{"hello":"Hello"}' },
      { key: 'nodeB', codeLang: 'en-US', content: '{"bye":"Bye"}' },
    ]);

    expect(result).toBe('{"en-US":{"nodeA":{"hello":"Hello"},"nodeB":{"bye":"Bye"}}}');
  });

  it('creates separate top-level lang keys for different codeLang, in first-seen order', () => {
    const result = groupAndSerializeLocales([
      { key: 'nodeA', codeLang: 'en-US', content: '{"hello":"Hello"}' },
      { key: 'nodeA', codeLang: 'fr', content: '{"hello":"Bonjour"}' },
    ]);

    expect(result).toBe('{"en-US":{"nodeA":{"hello":"Hello"}},"fr":{"nodeA":{"hello":"Bonjour"}}}');
  });

  it('inserts content raw/unescaped, not re-JSON.stringify-ed', () => {
    const result = groupAndSerializeLocales([{ key: 'nodeA', codeLang: 'en-US', content: '{"a":1}' }]);

    expect(result).toBe('{"en-US":{"nodeA":{"a":1}}}');
    expect(result).not.toContain('\\"a\\"');
  });
});
