import * as _path from 'node:path';
import { globSync } from 'fast-glob';
import { currentContext } from '../../current-context';

function getFinalSrcPath(path: string) {
  const cleaned = path.replace(currentContext.pathResourcesDir, '');

  return `resources/${currentContext.packageName}${cleaned}`;
}

function wrapJs(srcPath: string) {
  return `<script src="${srcPath}"></script>`;
}

function wrapCss(srcPath: string) {
  return `<link rel="stylesheet" href="${srcPath}">`;
}

async function processResources(path: string) {
  const parsed = _path.parse(path);

  if (parsed.ext === '.js') {
    return wrapJs(getFinalSrcPath(path));
  }
  return wrapCss(getFinalSrcPath(path));
}

export async function getResources() {
  const path = currentContext.pathResourcesDir;
  const files = globSync(`${path}/**/*.{js,css}`, { onlyFiles: true });
  const result = await Promise.all(files.map(processResources));

  return result.join('');
}
