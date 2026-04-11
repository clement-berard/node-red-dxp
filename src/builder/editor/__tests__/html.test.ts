import { readFileSync } from 'node:fs';
import { globSync } from 'fast-glob';
import pug from 'pug';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanSpaces } from '../../../tools/common-utils';
import { getNodesHtml, minifyHtml } from '../html';
import { updateI18nAttributes } from '../i18n';

// Mocks
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}));

vi.mock('fast-glob', () => ({
  globSync: vi.fn(),
}));

vi.mock('pug', () => ({
  default: {
    renderFile: vi.fn(),
  },
}));

vi.mock('../../../tools/common-utils', () => ({
  cleanSpaces: vi.fn((str) => str.replace(/\s+/g, ' ').trim()),
}));

vi.mock('../i18n', () => ({
  updateI18nAttributes: vi.fn((_name, html) => html.replace('MOCKED_I18N', 'I18N_DONE')),
}));

describe('minifyHtml', () => {
  it('minifies html by removing comments and collapsing whitespace', async () => {
    const rawHtml = `
      <div>
        <!-- some comment -->
        <p>Hello   World</p>
      </div>
    `;
    const result = await minifyHtml(rawHtml);
    expect(result).toBe('<div><p>Hello World</p></div>');
  });
});

describe('getNodesHtml', () => {
  const mockNode = {
    name: 'test-node',
    nodeIdentifier: 'node-123',
    editor: {
      pugPath: '/path/to/editor.pug',
      htmlPath: '/path/to/editor.html',
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('processes a node using pug when pug file exists', async () => {
    vi.mocked(globSync).mockReturnValue(['/path/to/editor.pug']);
    // @ts-expect-error
    vi.mocked(pug.renderFile).mockReturnValue('<p>Pug Content MOCKED_I18N</p>');

    const result = await getNodesHtml({
      nodes: [mockNode],
      packageNameSlug: 'my-pkg',
      minify: false,
    });

    expect(pug.renderFile).toHaveBeenCalledWith('/path/to/editor.pug');
    expect(readFileSync).not.toHaveBeenCalled();
    expect(updateI18nAttributes).toHaveBeenCalled();

    expect(result.html).toContain('class="my-pkg"');
    expect(result.html).toContain('id="node-123"');
    expect(result.html).toContain('Pug Content I18N_DONE');

    expect(result.allWrappedHtml).toContain('<script type="text/html" data-template-name="test-node">');
    expect(result.allWrappedHtml).toContain('Pug Content I18N_DONE');
  });

  it('processes a node using html when pug file does not exist', async () => {
    vi.mocked(globSync).mockReturnValue([]);
    vi.mocked(readFileSync).mockReturnValue('<p>HTML Content MOCKED_I18N</p>');

    const result = await getNodesHtml({
      nodes: [mockNode],
      packageNameSlug: 'my-pkg',
      minify: false,
    });

    expect(globSync).toHaveBeenCalledWith('/path/to/editor.pug', { onlyFiles: true });
    expect(pug.renderFile).not.toHaveBeenCalled();
    expect(readFileSync).toHaveBeenCalledWith('/path/to/editor.html', 'utf8');

    expect(result.html).toContain('HTML Content I18N_DONE');
  });

  it('minifies HTML when minify is true', async () => {
    vi.mocked(globSync).mockReturnValue([]);
    vi.mocked(readFileSync).mockReturnValue('   <p>   HTML   </p>   ');

    const result = await getNodesHtml({
      nodes: [mockNode],
      packageNameSlug: 'my-pkg',
      minify: true,
    });

    expect(cleanSpaces).toHaveBeenCalled();
    expect(result.html).toContain('<div class="my-pkg"><div id="node-123"><p>HTML</p></div></div>');
  });

  it('handles multiple nodes and joins their html correctly', async () => {
    const node1 = { ...mockNode, name: 'node1', nodeIdentifier: 'id-1' };
    const node2 = { ...mockNode, name: 'node2', nodeIdentifier: 'id-2' };

    vi.mocked(globSync).mockReturnValue([]);
    vi.mocked(readFileSync).mockReturnValue('<p>Content</p>');

    const result = await getNodesHtml({
      nodes: [node1, node2],
      packageNameSlug: 'pkg',
      minify: false,
    });

    expect(result.html).toContain('id="id-1"');
    expect(result.html).toContain('id="id-2"');

    expect(result.allWrappedHtml).toContain('data-template-name="node1"');
    expect(result.allWrappedHtml).toContain('data-template-name="node2"');
  });
});
