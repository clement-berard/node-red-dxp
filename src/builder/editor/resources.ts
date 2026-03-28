import * as _path from 'node:path';
import { globSync } from 'fast-glob';
import { currentContext } from '../../current-context';

export function parseFileAttrs(filename: string): { attrs: Record<string, string | boolean> } {
  const match = filename.match(/\[attrs=([^\]]+)\]/);
  if (!match) return { attrs: {} };

  const attrs: Record<string, string | boolean> = {};
  match[1].split(',').forEach((attr) => {
    const [key, value] = attr.trim().split('=');
    attrs[key.trim()] = value ? value.trim() : true;
  });

  return { attrs };
}

export function getFinalSrcPath(path: string) {
  const cleaned = path.replace(currentContext.pathResourcesDir, '').replace(/\[attrs=[^\]]+\]/, '');

  return `resources/${currentContext.packageName}${cleaned}`;
}

export function wrapJsMarkup(srcPath: string, attrs: Record<string, string | boolean> = {}) {
  const attrsStr = Object.entries(attrs)
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');

  return `<script src="${srcPath}"${attrsStr ? ` ${attrsStr}` : ''}></script>`;
}

export function wrapCssMarkup(srcPath: string, attrs: Record<string, string | boolean> = {}) {
  const attrsStr = Object.entries(attrs)
    .map(([k, v]) => (v === true ? k : `${k}="${v}"`))
    .join(' ');

  return `<link rel="stylesheet" href="${srcPath}"${attrsStr ? ` ${attrsStr}` : ''}>`;
}

async function processResources(path: string) {
  const parsed = _path.parse(path);
  const { attrs } = parseFileAttrs(parsed.base);
  const srcPath = getFinalSrcPath(path);

  if (parsed.ext === '.js') {
    return wrapJsMarkup(srcPath, attrs);
  }
  return wrapCssMarkup(srcPath, attrs);
}

export async function getResources(): Promise<string> {
  const path = currentContext.pathResourcesDir;
  const files = globSync(`${path}/**/*.{js,css}`, { onlyFiles: true });
  const result = await Promise.all(files.map(processResources));

  return result.join('');
}
