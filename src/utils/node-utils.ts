import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';

// dist folder path
export const distributionPackagePath = `${path.resolve(__dirname, '..')}`;

export function createFolderIfNotExists(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  try {
    await fsPromise.writeFile(path, content);
  } catch (error) {
    console.error('Error writing controller index:', error);
  }
}

export async function doesFolderExist(absolutePath: string): Promise<boolean> {
  try {
    const stats = await fsPromise.stat(absolutePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

export async function cleanPaths(paths: string[]): Promise<void> {
  for (const dirPath of paths) {
    try {
      const resolvedPath = path.resolve(dirPath);

      const stats = await fsPromise.stat(resolvedPath).catch(() => null);

      if (stats?.isDirectory()) {
        await fsPromise.rm(resolvedPath, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Error cleaning path (${dirPath}): ${error}`);
    }
  }
}
