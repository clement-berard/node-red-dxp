import fs from 'node:fs';
import fsPromise from 'node:fs/promises';
import path from 'node:path';

export function cleanSpaces(str: string) {
  return str.trim().replace(/\n\s+/g, '');
}

export async function cleanPaths(paths: string[]): Promise<void> {
  for (const dirPath of paths) {
    try {
      const resolvedPath = path.resolve(dirPath);

      const stats = await fsPromise.stat(resolvedPath).catch(() => null);

      if (stats?.isDirectory()) {
        await fsPromise.rm(resolvedPath, { recursive: true, force: true });
      } else {
        console.log(`Path does not exist or is not a directory: ${resolvedPath}`);
      }
    } catch (error) {
      console.error(`Error cleaning path (${dirPath}): ${error}`);
    }
  }
}

export function ensureDirectoryExists(dirPath: string): void {
  const fullPath = path.resolve(dirPath);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
}

export async function writeFile(path: string, content: string): Promise<void> {
  try {
    await fsPromise.writeFile(path, content);
  } catch (error) {
    console.error('Error writing controller index:', error);
  }
}
