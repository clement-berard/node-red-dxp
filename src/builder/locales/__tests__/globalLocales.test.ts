import fsPromise from 'node:fs/promises';
import { describe, expect, it, vi } from 'vitest';
import { getGlobalLocales } from '../globalLocales';
import { groupAndSerializeLocales } from '../serializeLocales';

const { listNodesFullNamesMock, resolvedSrcLocalesPathsMock } = vi.hoisted(() => ({
  listNodesFullNamesMock: [] as string[],
  resolvedSrcLocalesPathsMock: [] as string[],
}));

vi.mock('../../../current-context', () => ({
  currentContext: {
    get listNodesFullNames() {
      return listNodesFullNamesMock;
    },
    get resolvedSrcLocalesPaths() {
      return resolvedSrcLocalesPathsMock;
    },
  },
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

describe('getGlobalLocales', () => {
  it('cross-joins nodes and locale files content', async () => {
    listNodesFullNamesMock.length = 0;
    listNodesFullNamesMock.push('node-a', 'node-b');
    resolvedSrcLocalesPathsMock.length = 0;
    resolvedSrcLocalesPathsMock.push('/src/locales/en-US.json');

    vi.mocked(fsPromise.readFile).mockResolvedValue('{"hello":"Hello"}' as any);

    const result = await getGlobalLocales();

    const expectedEntries = [
      { key: 'node-a', codeLang: 'en-US', content: '{"hello":"Hello"}' },
      { key: 'node-b', codeLang: 'en-US', content: '{"hello":"Hello"}' },
    ];

    expect(result).toBe(groupAndSerializeLocales(expectedEntries));
  });

  it('cross-joins multiple locale files and multiple nodes, parsing codeLang from filenames', async () => {
    listNodesFullNamesMock.length = 0;
    listNodesFullNamesMock.push('node-a', 'node-b');
    resolvedSrcLocalesPathsMock.length = 0;
    resolvedSrcLocalesPathsMock.push('/src/locales/en-US.json', '/src/locales/fr.json');

    vi.mocked(fsPromise.readFile).mockImplementation(async (path) => {
      if (path === '/src/locales/en-US.json') return '{"hello":"Hello"}';
      if (path === '/src/locales/fr.json') return '{"hello":"Bonjour"}';
      throw new Error(`unexpected path ${path}`);
    });

    const result = await getGlobalLocales();

    const expectedEntries = [
      { key: 'node-a', codeLang: 'en-US', content: '{"hello":"Hello"}' },
      { key: 'node-a', codeLang: 'fr', content: '{"hello":"Bonjour"}' },
      { key: 'node-b', codeLang: 'en-US', content: '{"hello":"Hello"}' },
      { key: 'node-b', codeLang: 'fr', content: '{"hello":"Bonjour"}' },
    ];

    expect(result).toBe(groupAndSerializeLocales(expectedEntries));
  });

  it('returns "{}" when there are no locale files', async () => {
    listNodesFullNamesMock.length = 0;
    listNodesFullNamesMock.push('node-a');
    resolvedSrcLocalesPathsMock.length = 0;

    const result = await getGlobalLocales();

    expect(result).toBe(groupAndSerializeLocales([]));
    expect(result).toBe('{}');
  });

  it('returns "{}" when there are no nodes, even with locale files present', async () => {
    listNodesFullNamesMock.length = 0;
    resolvedSrcLocalesPathsMock.length = 0;
    resolvedSrcLocalesPathsMock.push('/src/locales/en-US.json');

    vi.mocked(fsPromise.readFile).mockResolvedValue('{"hello":"Hello"}' as any);

    const result = await getGlobalLocales();

    expect(result).toBe(groupAndSerializeLocales([]));
    expect(result).toBe('{}');
  });
});
