import fsPromise from 'node:fs/promises';
import purgeCss from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { glob } from 'fast-glob';
import postcss from 'postcss';
import * as sass from 'sass';
import tailwindcss from 'tailwindcss';
import { currentContext, type ListNodesFull } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { distributionPackagePath } from '../../tools/node-utils';

const forcedIncludeInternal = currentContext.config.builder.tailwind.forcedClassesInclusion;

const allClassesIncluded = [...forcedIncludeInternal, ...forcedIncludeInternal.map((item) => `!${item}`)];

async function processCSS(cssString: string, htmlString: string): Promise<string> {
  const result = await postcss([
    purgeCss({
      content: [{ raw: htmlString, extension: 'html' }],
      safelist: [/^!/, /^\\!/, /^\\:/, ...allClassesIncluded],
    }),
    autoprefixer,
    cssnano({ preset: 'default' }),
  ]).process(cssString, { from: undefined });

  return result.css;
}

async function compileScss(filePath: string): Promise<string> {
  const result = await sass.compileAsync(filePath, { style: 'expanded' });
  return result.css;
}

async function buildStyles(files: string[]): Promise<Record<string, string>> {
  const compiled = await Promise.all(files.map(async (filePath) => [filePath, await compileScss(filePath)] as const));
  return Object.fromEntries(compiled);
}

export async function getNodesStyles(nodes: ListNodesFull) {
  const hasStyles = nodes.some((node) => node.editor.scssFiles.length);
  if (!hasStyles) {
    return [];
  }
  return Promise.all(
    nodes
      .filter((node) => node.editor.scssFiles.length)
      .map(async (node) => {
        const nodeStyles = await buildStyles(node.editor.scssFiles);
        const mergedCompiledStyles = Object.values(nodeStyles).join('');
        return {
          name: node.name,
          mergedCompiledStyles,
          scssFinal: `
        #${node.nodeIdentifier}{
          ${mergedCompiledStyles}
        }`,
        };
      }),
  );
}

export async function generateCSSFromHTMLWithTailwind(htmlString: string, tailwindConfig: any = {}) {
  const defaultConfig = {
    content: [{ raw: htmlString }, { raw: allClassesIncluded.join(' ') }],
    theme: {},
  };

  const finalConfig = { ...defaultConfig, ...tailwindConfig };

  const tailwindMatches = await glob(
    `${distributionPackagePath}/${fixedConfig.nodes.editor.dirName}/assets/tailwind.scss`,
  );
  const tailwindScssFilePath = tailwindMatches[0];

  const scssString = tailwindScssFilePath.length ? await fsPromise.readFile(tailwindScssFilePath, 'utf8') : '';

  const result = await postcss([tailwindcss(finalConfig), require('autoprefixer')]).process(scssString, {
    from: undefined,
  });

  return result.css;
}

export async function getSrcStyles() {
  const srcStyles = currentContext.resolvedSrcPathsScss;
  if (!srcStyles.length) {
    return '';
  }
  const srcStylesCompiled = await buildStyles([...srcStyles]);
  return Object.values(srcStylesCompiled).join('');
}

type GetAllCompiledStylesParams = {
  rawHtml: string;
  minify?: boolean;
  nodes: ListNodesFull;
};

export async function getAllCompiledStyles(params: GetAllCompiledStylesParams) {
  const getSrcWrapper = (content: string) => `.${currentContext.packageNameSlug}{${content}}`;
  const { rawHtml, minify = false, nodes } = params || {};

  const [srcStyles, nodesStyles, twCss] = await Promise.all([
    getSrcStyles(),
    getNodesStyles(nodes),
    generateCSSFromHTMLWithTailwind(rawHtml),
  ]);

  const allNodesStyles = nodesStyles.map((node) => node.scssFinal).join('\n');

  const [finalTwCss, otherCss] = await Promise.all([
    minify ? postcss([cssnano({ preset: 'default' })]).process(twCss, { from: undefined }) : twCss,
    minify ? processCSS(`${srcStyles}${allNodesStyles}`, rawHtml) : `${srcStyles}${allNodesStyles}`,
  ]);

  return getSrcWrapper(`${finalTwCss}${otherCss}`);
}
