import esbuild from 'esbuild';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { currentContext } from '../../../current-context';
import { fixedConfig } from '../../../fixed-config';
import { writeFile } from '../../../tools/node-utils';
import { buildEditor } from '../buildEditor';
import { getDocs } from '../docs';
import { getNodesHtml } from '../html';
import { getResources } from '../resources';
import { getAllCompiledStyles } from '../styles';
import { getSveltePlugins, getSvelteSources } from '../svelte';

const { mockNodeA, mockNodeB } = vi.hoisted(() => ({
  mockNodeA: {
    name: 'node-a',
    pascalName: 'NodeA',
    editor: { tsPath: '/src/nodes/node-a/editor/index.ts' },
  } as any,
  mockNodeB: {
    name: 'node-b',
    pascalName: 'NodeB',
    editor: { tsPath: '/src/nodes/node-b/editor/index.ts' },
  } as any,
}));

vi.mock('../../../current-context', () => ({
  currentContext: {
    listNodesFull: [mockNodeA, mockNodeB],
    packageNameSlug: 'my-pkg',
    pathDist: '/proj/dist',
    cacheDirFiles: {
      editorIndex: '/proj/.cache/editor-index.ts',
    },
  },
}));

vi.mock('../../../tools/node-utils', () => ({
  writeFile: vi.fn(),
}));

vi.mock('esbuild', () => ({
  default: {
    build: vi.fn(),
  },
}));

vi.mock('../docs', () => ({
  getDocs: vi.fn(),
}));

vi.mock('../html', () => ({
  getNodesHtml: vi.fn(),
}));

vi.mock('../resources', () => ({
  getResources: vi.fn(),
}));

vi.mock('../svelte', () => ({
  getSveltePlugins: vi.fn(),
  getSvelteSources: vi.fn(),
}));

vi.mock('../styles', () => ({
  getAllCompiledStyles: vi.fn(),
}));

describe('buildEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(esbuild.build).mockResolvedValue({ outputFiles: [{ text: 'JS' }] } as any);
    vi.mocked(getDocs).mockResolvedValue('DOCS');
    vi.mocked(getResources).mockResolvedValue('RESOURCES');
    vi.mocked(getNodesHtml).mockResolvedValue({ html: 'RAWHTML', allWrappedHtml: 'WRAPPEDHTML' } as any);
    vi.mocked(getAllCompiledStyles).mockResolvedValue('CSS');
    vi.mocked(getSveltePlugins).mockResolvedValue([{ name: 'svelte-plugin' }] as any);
    vi.mocked(getSvelteSources).mockResolvedValue('');
  });

  it('generates one import + one registerType line per node in the editor index content', async () => {
    await buildEditor();

    const firstCallContent = vi.mocked(writeFile).mock.calls[0][1];

    expect(firstCallContent).toContain(`import NodeA from '${mockNodeA.editor.tsPath}';`);
    expect(firstCallContent).toContain(`window.RED.nodes.registerType('node-a', NodeA);`);
    expect(firstCallContent).toContain(`import NodeB from '${mockNodeB.editor.tsPath}';`);
    expect(firstCallContent).toContain(`window.RED.nodes.registerType('node-b', NodeB);`);
  });

  it('uses outputFiles[0].text from esbuild.build in the final html script tag', async () => {
    vi.mocked(esbuild.build).mockResolvedValue({ outputFiles: [{ text: 'const x=1;' }] } as any);

    await buildEditor();

    const secondCallContent = vi.mocked(writeFile).mock.calls[1][1];
    expect(secondCallContent).toContain('<script type="application/javascript">const x=1;</script>');
  });

  it('falls back to empty string when outputFiles is an empty array', async () => {
    vi.mocked(esbuild.build).mockResolvedValue({ outputFiles: [] } as any);

    await buildEditor();

    const secondCallContent = vi.mocked(writeFile).mock.calls[1][1];
    expect(secondCallContent).toContain('<script type="application/javascript"></script>');
  });

  it('falls back to empty string when outputFiles key is absent entirely', async () => {
    vi.mocked(esbuild.build).mockResolvedValue({} as any);

    await buildEditor();

    const secondCallContent = vi.mocked(writeFile).mock.calls[1][1];
    expect(secondCallContent).toContain('<script type="application/javascript"></script>');
  });

  it('assembles the final html from resources, wrapped html, css, js and docs', async () => {
    await buildEditor();

    const secondCallContent = vi.mocked(writeFile).mock.calls[1][1];

    expect(secondCallContent).toBe(
      'RESOURCES\nWRAPPEDHTML\n<style>CSS</style>\n<script type="application/javascript">JS</script>\nDOCS',
    );
  });

  it('threads minify through esbuild, getNodesHtml and getAllCompiledStyles', async () => {
    await buildEditor({ minify: true });

    expect(esbuild.build).toHaveBeenCalledWith(expect.objectContaining({ minify: true }));
    expect(getNodesHtml).toHaveBeenCalledWith(expect.objectContaining({ minify: true }));
    expect(getAllCompiledStyles).toHaveBeenCalledWith(expect.objectContaining({ minify: true }));
  });

  it('calls writeFile twice: editor index path first, then the final html path', async () => {
    await buildEditor();

    expect(writeFile).toHaveBeenCalledTimes(2);
    expect(vi.mocked(writeFile).mock.calls[0][0]).toBe('/proj/.cache/editor-index.ts');
    expect(vi.mocked(writeFile).mock.calls[1][0]).toBe(`/proj/dist/${fixedConfig.nodes.editor.htmlName}.html`);
  });

  it('passes html.html (raw), not allWrappedHtml, as rawHtml to getAllCompiledStyles', async () => {
    await buildEditor();

    expect(getAllCompiledStyles).toHaveBeenCalledWith(expect.objectContaining({ rawHtml: 'RAWHTML' }));
    expect(getAllCompiledStyles).not.toHaveBeenCalledWith(expect.objectContaining({ rawHtml: 'WRAPPEDHTML' }));
  });

  it('loads no svelte plugin when no node is a svelte node', async () => {
    await buildEditor();

    expect(getSveltePlugins).not.toHaveBeenCalled();
    expect(esbuild.build).toHaveBeenCalledWith(expect.objectContaining({ plugins: [] }));
    expect(vi.mocked(writeFile).mock.calls[0][1]).not.toContain('defineSvelteNode');
  });

  describe('with a svelte node', () => {
    const svelteNode = {
      name: 'node-s',
      pascalName: 'NodeS',
      nodeIdentifier: 'my-pkg-node-s',
      editor: {
        tsPath: '/src/nodes/node-s/editor/index.ts',
        sveltePath: '/src/nodes/node-s/node-s.svelte',
        hasSvelte: true,
      },
    } as any;
    const original = currentContext.listNodesFull;

    beforeEach(() => {
      (currentContext as any).listNodesFull = [...original, svelteNode];
    });

    afterEach(() => {
      (currentContext as any).listNodesFull = original;
    });

    it('registers it through defineSvelteNode with the module of the svelte file', async () => {
      await buildEditor();

      const content = vi.mocked(writeFile).mock.calls[0][1];
      expect(content).toContain("import { defineSvelteNode } from '@keload/node-red-dxp/editor/svelte';");
      expect(content).toContain("import SvelteRoot from '@keload/node-red-dxp/editor/svelte/Root.svelte';");
      expect(content).toContain("import * as NodeS from '/src/nodes/node-s/node-s.svelte';");
      expect(content).toContain(
        "window.RED.nodes.registerType('node-s', defineSvelteNode({ name: 'node-s', identifier: 'my-pkg-node-s', root: SvelteRoot, module: NodeS }));",
      );
    });

    it('keeps the classic nodes registered as before', async () => {
      await buildEditor();

      const content = vi.mocked(writeFile).mock.calls[0][1];
      expect(content).toContain("window.RED.nodes.registerType('node-a', NodeA);");
    });

    it('gives esbuild the svelte plugins and the svelte sources to tailwind', async () => {
      vi.mocked(getSvelteSources).mockResolvedValue('SVELTE SOURCES');

      await buildEditor();

      expect(esbuild.build).toHaveBeenCalledWith(expect.objectContaining({ plugins: [{ name: 'svelte-plugin' }] }));
      expect(getAllCompiledStyles).toHaveBeenCalledWith(
        expect.objectContaining({ rawHtml: 'RAWHTML\nSVELTE SOURCES' }),
      );
    });
  });
});
