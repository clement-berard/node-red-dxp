import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';

// dist folder path
export const distributionPackagePath = `${path.resolve(__dirname, '..')}`;

export function createFolderIfNotExists(folderPath: string) {
  fs.mkdirSync(folderPath, { recursive: true });
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fsPromise.writeFile(filePath, content);
}

export async function cleanPaths(paths: string[]): Promise<void> {
  await Promise.all(paths.map((dirPath) => fsPromise.rm(path.resolve(dirPath), { recursive: true, force: true })));
}
