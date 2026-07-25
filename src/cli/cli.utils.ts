import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { Command } from 'commander';
import { consola } from 'consola';
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

export async function getLatestNpmPackageVersion(packageName: string) {
  try {
    const response = await fetch(`https://registry.npmjs.org/${packageName}/latest`);

    if (!response.ok) {
      throw new Error(`Package ${packageName} not found`);
    }

    const data = await response.json();
    return data.version as string;
  } catch (error) {
    consola.error(`Error fetching version for ${packageName}:`, error);
    throw error;
  }
}
