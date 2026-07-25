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

vi.mock('autoprefixer', () => ({ default: vi.fn(() => 'autoprefixer-marker') }));
vi.mock('cssnano', () => ({ default: vi.fn(() => 'cssnano-marker') }));
vi.mock('tailwindcss', () => ({ default: vi.fn(() => 'tailwindcss-marker') }));
vi.mock('@fullhuman/postcss-purgecss', () => ({ default: vi.fn(() => 'purgecss-marker') }));

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

  it('reads the tailwind.scss found by glob and processes it through postcss (default config)', async () => {
    vi.mocked(glob).mockResolvedValue(['/pkg-dist/editor/assets/tailwind.scss'] as any);
    vi.mocked(fsPromise.readFile).mockResolvedValue('tailwind-scss-content' as any);

    const result = await generateCSSFromHTMLWithTailwind('<div>html</div>');

    expect(glob).toHaveBeenCalledWith(`/pkg-dist/${fixedConfig.nodes.editor.dirName}/assets/tailwind.scss`);
    expect(fsPromise.readFile).toHaveBeenCalledWith('/pkg-dist/editor/assets/tailwind.scss', 'utf8');
    expect(result).toBe('processed(tailwind-scss-content)');
  });

  it('a custom tailwindConfig.content shallow-replaces the default content array entirely (current quirk)', async () => {
    vi.mocked(glob).mockResolvedValue(['/pkg-dist/editor/assets/tailwind.scss'] as any);
    vi.mocked(fsPromise.readFile).mockResolvedValue('tailwind-scss-content' as any);

    await generateCSSFromHTMLWithTailwind('<div>html</div>', { content: ['custom'] });

    const tailwindcssModule = await import('tailwindcss');
    const calledConfig = vi.mocked(tailwindcssModule.default).mock.calls[0][0] as any;

    // Because generateCSSFromHTMLWithTailwind does `{ ...defaultConfig, ...tailwindConfig }`,
    // passing a custom `content` key REPLACES the default content array wholesale
    // (it does NOT merge/append to the html/allClassesIncluded raw entries).
    expect(calledConfig.content).toEqual(['custom']);
  });
});

describe('getAllCompiledStyles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolvedSrcPathsScssMock.length = 0;
    vi.mocked(glob).mockResolvedValue(['/pkg-dist/editor/assets/tailwind.scss'] as any);
    vi.mocked(fsPromise.readFile).mockResolvedValue('tailwind-scss-content' as any);
  });

  it('does not run extra postcss steps (minify/purge) when minify is false', async () => {
    const nodes = [{ name: 'node-a', nodeIdentifier: 'id-a', editor: { scssFiles: ['/a/style1.scss'] } }] as any;

    const result = await getAllCompiledStyles({ rawHtml: '<div>html</div>', minify: false, nodes });

    // postcss is called exactly once: inside generateCSSFromHTMLWithTailwind (tailwind step).
    expect(postcss).toHaveBeenCalledTimes(1);

    expect(result).toContain('.my-pkg{');
    // raw twCss from the mocked tailwind postcss processing
    expect(result).toContain('processed(tailwind-scss-content)');
    // otherCss is raw concatenation of srcStyles + node styles (no minify/purge applied)
    expect(result).toContain('/*/a/style1.scss*/');
  });

  it('runs the extra postcss steps (minify + purge) when minify is true', async () => {
    const nodes = [{ name: 'node-a', nodeIdentifier: 'id-a', editor: { scssFiles: ['/a/style1.scss'] } }] as any;

    await getAllCompiledStyles({ rawHtml: '<div>html</div>', minify: true, nodes });

    // 1: tailwind step inside generateCSSFromHTMLWithTailwind
    // 2: finalTwCss cssnano minify step
    // 3: otherCss processCSS (purge/autoprefixer/cssnano) step
    expect(postcss).toHaveBeenCalledTimes(3);
  });

  it('wraps the final result as .packageNameSlug{finalTwCss+otherCss}', async () => {
    const nodes: any[] = [];

    const result = await getAllCompiledStyles({ rawHtml: '<div>html</div>', minify: false, nodes });

    expect(result.startsWith('.my-pkg{')).toBe(true);
    expect(result.endsWith('}')).toBe(true);
  });
});
