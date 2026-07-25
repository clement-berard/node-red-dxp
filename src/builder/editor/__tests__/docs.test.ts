import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDocs } from '../docs';

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  mdxToMd: vi.fn(),
  listNodesFull: [] as Array<{ name: string; doc: { mdxFiles: string[]; mdFiles: string[] } }>,
}));

vi.mock('../../../current-context', () => ({
  currentContext: {
    get listNodesFull() {
      return mocks.listNodesFull;
    },
  },
}));

vi.mock('mdx-to-md', () => ({
  mdxToMd: mocks.mdxToMd,
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: mocks.readFile,
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.listNodesFull = [];
  mocks.readFile.mockResolvedValue('');
  mocks.mdxToMd.mockResolvedValue('');
});

describe('getDocs', () => {
  it('excludes nodes with no mdx and no md files, returning "" when it is the only node', async () => {
    mocks.listNodesFull = [{ name: 'foo-node', doc: { mdxFiles: [], mdFiles: [] } }];

    const result = await getDocs();

    expect(result).toBe('');
    expect(mocks.readFile).not.toHaveBeenCalled();
    expect(mocks.mdxToMd).not.toHaveBeenCalled();
  });

  it('reads a .md file via fsPromise.readFile and wraps it in a script tag', async () => {
    mocks.listNodesFull = [{ name: 'foo-node', doc: { mdxFiles: [], mdFiles: ['/path/docs.md'] } }];
    mocks.readFile.mockResolvedValue('# Foo docs');

    const result = await getDocs();

    expect(mocks.readFile).toHaveBeenCalledWith('/path/docs.md', 'utf8');
    expect(result).toBe('<script type="text/markdown" data-help-name="foo-node">\n# Foo docs\n</script>');
  });

  it('processes a .mdx file via mdxToMd instead of readFile', async () => {
    mocks.listNodesFull = [{ name: 'foo-node', doc: { mdxFiles: ['/path/docs.mdx'], mdFiles: [] } }];
    mocks.mdxToMd.mockResolvedValue('# Foo mdx docs');

    const result = await getDocs();

    expect(mocks.mdxToMd).toHaveBeenCalledWith('/path/docs.mdx');
    expect(mocks.readFile).not.toHaveBeenCalled();
    expect(result).toBe('<script type="text/markdown" data-help-name="foo-node">\n# Foo mdx docs\n</script>');
  });

  it('prefers .mdx over .md when both are present', async () => {
    mocks.listNodesFull = [{ name: 'foo-node', doc: { mdxFiles: ['/path/docs.mdx'], mdFiles: ['/path/docs.md'] } }];
    mocks.mdxToMd.mockResolvedValue('# Foo mdx docs');

    await getDocs();

    expect(mocks.mdxToMd).toHaveBeenCalledWith('/path/docs.mdx');
    expect(mocks.readFile).not.toHaveBeenCalled();
  });

  it('joins multiple qualifying doc nodes with a newline, preserving order', async () => {
    mocks.listNodesFull = [
      { name: 'foo-node', doc: { mdxFiles: [], mdFiles: ['/path/foo.md'] } },
      { name: 'bar-node', doc: { mdxFiles: ['/path/bar.mdx'], mdFiles: [] } },
    ];
    mocks.readFile.mockResolvedValue('foo content');
    mocks.mdxToMd.mockResolvedValue('bar content');

    const result = await getDocs();

    expect(result).toBe(
      [
        '<script type="text/markdown" data-help-name="foo-node">\nfoo content\n</script>',
        '<script type="text/markdown" data-help-name="bar-node">\nbar content\n</script>',
      ].join('\n'),
    );
  });

  it('returns "" when there are zero nodes at all', async () => {
    mocks.listNodesFull = [];

    const result = await getDocs();

    expect(result).toBe('');
  });
});
