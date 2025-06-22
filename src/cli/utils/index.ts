import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

export function resolveHomePath(path: string): string {
  if (path.startsWith('~')) {
    return join(homedir(), path.slice(1));
  }
  return resolve(path);
}
