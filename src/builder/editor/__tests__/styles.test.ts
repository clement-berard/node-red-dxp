import fsPromise from 'node:fs/promises';
import { glob } from 'fast-glob';
import postcss from 'postcss';
import * as sass from 'sass';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fixedConfig } from '../../../fixed-config';
import { generateCSSFromHTMLWithTailwind, getAllCompiledStyles, getNodesStyles, getSrcStyles } from '../styles';

const { forcedClassesInclusionMock, resolvedSrcPathsScssMock } = vi.hoisted(() => ({
  forcedClassesInclusionMock: ['forced-a'] as string[],
  resolvedSrcPathsScssMock: [] as string[],
}));

vi.mock('../../../current-context', () => ({
  currentContext: {
    config: {
      builder: {
        tailwind: {
          get forcedClassesInclusion() {
            return forcedClassesInclusionMock;
          },
        },
      },
    },
    get resolvedSrcPathsScss() {
      return resolvedSrcPathsScssMock;
    },
    packageNameSlug: 'my-pkg',
  },
}));

vi.mock('../../../tools/node-utils', () => ({
  distributionPackagePath: '/pkg-dist',
}));

vi.mock('sass', () => ({
  compileAsync: vi.fn((filePath: string) => Promise.resolve({ css: `/*${filePath}*/` })),
}));

vi.mock('fast-glob', () => ({
  glob: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: vi.fn(),
  },
}));

vi.mock('postcss', () => ({
  default: vi.fn(() => ({
    process: vi.fn((css: string) => Promise.resolve({ css: `processed(${css})` })),
  })),
}));

vi.mock('@fullhuman/postcss-purgecss', () => ({ default: vi.fn(() => 'purgecss-marker') }));

vi.mock('@tailwindcss/node', () => ({
  compile: vi.fn(async () => ({
    build: vi.fn((candidates: string[]) => `built(${candidates.join(',')})`),
  })),
  optimize: vi.fn((css: string) => ({ code: `optimized(${css})`, map: undefined })),
}));

vi.mock('@tailwindcss/oxide', () => {
  class Scanner {
    scanFiles = vi.fn((inputs: { content: string; extension: string }[]) => inputs.map((i) => i.content));
  }
  return { Scanner: vi.fn(Scanner) };
});

describe('getNodesStyles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns [] for an empty nodes array', async () => {
    expect(await getNodesStyles([] as any)).toEqual([]);
  });

  it('returns [] when no node has scss files', async () => {
    const nodes = [{ name: 'node-a', nodeIdentifier: 'id-a', editor: { scssFiles: [] } }] as any;
    expect(await getNodesStyles(nodes)).toEqual([]);
  });

  it('compiles all scss files for a node and merges/wraps the result', async () => {
    const nodes = [
      {
        name: 'node-a',
        nodeIdentifier: 'id-a',
        editor: { scssFiles: ['/a/style1.scss', '/a/style2.scss'] },
      },
    ] as any;

    const result = await getNodesStyles(nodes);

    expect(sass.compileAsync).toHaveBeenCalledTimes(2);
    expect(sass.compileAsync).toHaveBeenCalledWith('/a/style1.scss', { style: 'expanded' });
    expect(sass.compileAsync).toHaveBeenCalledWith('/a/style2.scss', { style: 'expanded' });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('node-a');
    expect(result[0].mergedCompiledStyles).toBe('/*/a/style1.scss*//*/a/style2.scss*/');
    expect(result[0].scssFinal).toContain('#id-a{');
    expect(result[0].scssFinal).toContain('/*/a/style1.scss*//*/a/style2.scss*/');
  });
});

describe('getSrcStyles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvedSrcPathsScssMock.length = 0;
  });

  it('returns "" when there are no src scss paths', async () => {
    expect(await getSrcStyles()).toBe('');
  });

  it('compiles and joins src scss paths', async () => {
    resolvedSrcPathsScssMock.push('/src/styles.scss', '/src/other.scss');

    const result = await getSrcStyles();

    expect(sass.compileAsync).toHaveBeenCalledTimes(2);
    expect(result).toBe('/*/src/styles.scss*//*/src/other.scss*/');
  });
});

describe('generateCSSFromHTMLWithTailwind', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the tailwind.scss found by glob, compiles it, and builds CSS from scanned candidates', async () => {
    vi.mocked(glob).mockResolvedValue(['/pkg-dist/editor/assets/tailwind.scss'] as any);
    vi.mocked(fsPromise.readFile).mockResolvedValue('tailwind-scss-content' as any);

    const result = await generateCSSFromHTMLWithTailwind('<div>html</div>');

    expect(glob).toHaveBeenCalledWith(`/pkg-dist/${fixedConfig.nodes.editor.dirName}/assets/tailwind.scss`);
    expect(fsPromise.readFile).toHaveBeenCalledWith('/pkg-dist/editor/assets/tailwind.scss', 'utf8');

    const { compile } = await import('@tailwindcss/node');
    expect(compile).toHaveBeenCalledWith('tailwind-scss-content', {
      base: '/pkg-dist/editor/assets',
      onDependency: expect.any(Function),
    });

    const { Scanner } = await import('@tailwindcss/oxide');
    expect(Scanner).toHaveBeenCalledWith({ sources: [] });
    const scannerInstance = vi.mocked(Scanner).mock.results[0].value;
    expect(scannerInstance.scanFiles).toHaveBeenCalledWith([
      { content: '<div>html</div>', extension: 'html' },
      { content: 'forced-a forced-a!', extension: 'html' },
    ]);

    // no purge step here (see the NOTE in generateCSSFromHTMLWithTailwind for why
    // purging it was reverted), but the built CSS still goes through the
    // restoreFormControlBorderRadiusPlugin postcss pass.
    expect(result).toBe('processed(built(<div>html</div>,forced-a forced-a!))');
  });

  it('returns "" without compiling when no tailwind.scss is found', async () => {
    vi.mocked(glob).mockResolvedValue([] as any);

    const result = await generateCSSFromHTMLWithTailwind('<div>html</div>');

    expect(result).toBe('');
    expect(fsPromise.readFile).not.toHaveBeenCalled();

    const { compile } = await import('@tailwindcss/node');
    const { Scanner } = await import('@tailwindcss/oxide');
    expect(compile).not.toHaveBeenCalled();
    expect(Scanner).not.toHaveBeenCalled();
  });
});

describe('getAllCompiledStyles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvedSrcPathsScssMock.length = 0;
    vi.mocked(glob).mockResolvedValue(['/pkg-dist/editor/assets/tailwind.scss'] as any);
    vi.mocked(fsPromise.readFile).mockResolvedValue('tailwind-scss-content' as any);
  });

  it('does not run extra postcss/optimize steps (minify/purge) when minify is false', async () => {
    const nodes = [{ name: 'node-a', nodeIdentifier: 'id-a', editor: { scssFiles: ['/a/style1.scss'] } }] as any;

    const result = await getAllCompiledStyles({ rawHtml: '<div>html</div>', minify: false, nodes });

    // 1: the tailwind step's restoreFormControlBorderRadiusPlugin pass (always runs), 2: the
    // final scopeThemeSelectors pass over the wrapped CSS (always runs, regardless of minify).
    expect(postcss).toHaveBeenCalledTimes(2);
    const { optimize } = await import('@tailwindcss/node');
    // optimize() now always runs (with minify:false) so Lightning CSS flattens the nesting
    // even in dev builds; it's the mock's `optimized(...)` wrapper that's now outermost.
    expect(optimize).toHaveBeenCalledTimes(1);
    expect(optimize).toHaveBeenCalledWith(expect.any(String), { minify: false });

    expect(result).toContain('.my-pkg{');
    // twCss from the mocked compile()/Scanner/restoreFormControlBorderRadiusPlugin processing
    expect(result).toContain('processed(built(<div>html</div>,forced-a forced-a!))');
    // otherCss is raw concatenation of srcStyles + node styles (no minify/purge applied)
    expect(result).toContain('/*/a/style1.scss*/');
  });

  it('runs the extra postcss/optimize steps (minify + purge) when minify is true', async () => {
    const nodes = [{ name: 'node-a', nodeIdentifier: 'id-a', editor: { scssFiles: ['/a/style1.scss'] } }] as any;

    await getAllCompiledStyles({ rawHtml: '<div>html</div>', minify: true, nodes });

    // 1: the tailwind step's restoreFormControlBorderRadiusPlugin pass (always-on), 2: otherCss's
    // purgeUnusedClasses pass (minify-only), 3: the final scopeThemeSelectors pass
    expect(postcss).toHaveBeenCalledTimes(3);

    const { optimize } = await import('@tailwindcss/node');
    // a single combined pass over the final wrapped+scoped CSS
    expect(optimize).toHaveBeenCalledTimes(1);
    expect(optimize).toHaveBeenCalledWith(expect.any(String), { minify: true });
  });

  it('wraps the final result as .packageNameSlug{twCss+otherCss} before scoping', async () => {
    const nodes: any[] = [];

    const result = await getAllCompiledStyles({ rawHtml: '<div>html</div>', minify: false, nodes });

    // twCss goes through restoreFormControlBorderRadiusPlugin, the whole wrap goes through
    // scopeThemeSelectors, then the result always goes through optimize(); the mocks wrap
    // each in a marker string.
    expect(result).toBe('optimized(processed(.my-pkg{processed(built(<div>html</div>,forced-a forced-a!))}))');
  });
});
