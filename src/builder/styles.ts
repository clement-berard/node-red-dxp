import path from 'node:path';
import { globSync } from 'glob';
import * as sass from 'sass';
import { currentInstance } from '../current-instance';

function compileScss(filePath: string): string {
  const result = sass.compile(filePath, { style: 'compressed' });
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

export function getNodesStyles() {
  const nodes = currentInstance.getListNodesFull();
  const hasStyles = nodes.some((node) => node.editor.scssFiles.length);
  if (!hasStyles) {
    return [];
  }
  return nodes
    .map((node) => {
      const nodeStyles = buildStyles(node.editor.scssFiles);
      const mergedCompiledStyles = Object.values(nodeStyles).join('');
      return {
        name: node.name,
        scssFinal: `#${node.nodeIdentifier}{${mergedCompiledStyles}}`,
        hasStyles: !!node.editor.scssFiles.length,
      };
    })
    .filter((node) => node.hasStyles);
}

export function getSrcStyles() {
  const srcStyles = currentInstance.getResolvedSrcPathsScss();
  const toAdd = globSync(`${path.resolve(__dirname, '..')}/editor/**/*.scss`);
  const srcStylesCompiled = buildStyles([...srcStyles, ...toAdd]);
  return Object.values(srcStylesCompiled).join('');
}

export function getAllCompiledStyles() {
  const srcStyles = getSrcStyles();
  const nodesStyles = getNodesStyles();

  if (!srcStyles && !nodesStyles.length) {
    return '';
  }

  return `.${currentInstance.packageNameSlug}{${srcStyles}${nodesStyles.map((node) => node.scssFinal).join('')}}`;
}

export function extractCSSClasses(htmlString: string): string[] {
  const classRegex = /class=["']([^"']+)["']/g;
  const classes: Set<string> = new Set();

  let match: RegExpExecArray | null = classRegex.exec(htmlString);

  while (match !== null) {
    const classList = match[1].split(/\s+/);

    for (const cls of classList) {
      classes.add(cls);
    }

    match = classRegex.exec(htmlString);
  }

  return Array.from(classes);
}
