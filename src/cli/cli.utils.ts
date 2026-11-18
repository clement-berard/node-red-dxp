import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import packageJson from '../../package.json';

export function createProgram(description: string): Command {
  return new Command().name('node-red-dxp').description(description).version(packageJson.version);
}

export function resolveHomePath(path: string): string {
  if (path.startsWith('~')) {
    return join(homedir(), path.slice(1));
  }
  return resolve(path);
}
