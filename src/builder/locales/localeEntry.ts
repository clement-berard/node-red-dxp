import fsPromise from 'node:fs/promises';
import path from 'node:path';

export async function readLocaleEntry(filePath: string) {
  const codeLang = path.basename(filePath).split('.')[0];
  const content = await fsPromise.readFile(filePath, 'utf-8');

  return { codeLang, content };
}
