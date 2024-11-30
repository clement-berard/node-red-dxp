import fs from 'node:fs';
import purgeCss from '@fullhuman/postcss-purgecss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { globSync } from 'fast-glob';
import postcss from 'postcss';
import * as sass from 'sass';
import tailwindcss from 'tailwindcss';
import { type ListNodesFull, currentContext } from '../../current-context';
import { fixedConfig } from '../../fixed-config';
import { distributionPackagePath } from '../../tools/node-utils';

const forcedIncludeInternal = [
  'hidden',
  'block',
  'font-bold',
  'red-ui-typedInput-container',
  'red-ui-typedInput-type-select',
  'red-ui-typedInput-type-label',
  'red-ui-typedInput-type-icon',
  ...currentContext.config.builder.tailwind.forcedClassesInclusion,
];

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

function compileScss(filePath: string): string {
  const result = sass.compile(filePath, { style: 'expanded' });
  return result.css;
}

function buildStyles(files: string[]): Record<string, string> {
  const styles: Record<string, string> = {};
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    styles[filePath] = compileScss(filePath);
  }
  return styles;
}

export function getNodesStyles(nodes: ListNodesFull) {
  const hasStyles = nodes.some((node) => node.editor.scssFiles.length);
  if (!hasStyles) {
    return [];
  }
  return nodes
    .filter((node) => node.editor.scssFiles.length)
    .map((node) => {
      const nodeStyles = buildStyles(node.editor.scssFiles);
      const mergedCompiledStyles = Object.values(nodeStyles).join('');
      return {
        name: node.name,
        mergedCompiledStyles,
        scssFinal: `
        #${node.nodeIdentifier}{
          ${mergedCompiledStyles}
        }`,
      };
    });
}

export async function generateCSSFromHTMLWithTailwind(htmlString: string, tailwindConfig: any = {}) {
  const defaultConfig = {
    content: [{ raw: htmlString }, { raw: allClassesIncluded.join(' ') }],
    theme: {},
  };

  const finalConfig = { ...defaultConfig, ...tailwindConfig };

  const tailwindScssFilePath = globSync(
    `${distributionPackagePath}/${fixedConfig.nodes.editor.dirName}/assets/tailwind.scss`,
  )[0];

  const scssString = tailwindScssFilePath.length ? fs.readFileSync(tailwindScssFilePath, 'utf8') : '';

  const result = await postcss([tailwindcss(finalConfig), require('autoprefixer')]).process(scssString, {
    from: undefined,
  });

  return result.css;
}

export function getSrcStyles() {
  const srcStyles = currentContext.resolvedSrcPathsScss;
  const srcStylesCompiled = buildStyles([...srcStyles]);
  return Object.values(srcStylesCompiled).join('');
}

type GetAllCompiledStylesParams = {
  rawHtml: string;
  minify?: boolean;
  nodes: ListNodesFull;
};

export async function getAllCompiledStyles(params: GetAllCompiledStylesParams) {
  const { rawHtml, minify = false, nodes } = params || {};
  const srcStyles = getSrcStyles();
  const nodesStyles = getNodesStyles(nodes);
  const twCss = await generateCSSFromHTMLWithTailwind(rawHtml);

  const getSrcWrapper = (content: string) => `.${currentContext.packageNameSlug}{${content}}`;
  const allNodesStyles = nodesStyles.map((node) => node.scssFinal).join('\n');

  const result = getSrcWrapper(`${twCss}${srcStyles}${allNodesStyles}`);

  return minify ? processCSS(result, rawHtml) : result;
}
