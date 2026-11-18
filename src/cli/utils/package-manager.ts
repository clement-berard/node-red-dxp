import type { AgentName } from 'package-manager-detector';
import { getUserAgent } from 'package-manager-detector/detect';

/** Package manager that launched the CLI (`pnpx`, `npx`, `yarn dlx`...), `npm` when unknown. */
export function getPackageManager(): AgentName {
  return getUserAgent() || 'npm';
}

/** Executable of a package manager (`yarn@berry` -> `yarn`). */
export function getPackageManagerBinary(pm: string): string {
  return pm.split('@')[0];
}

/** Command and arguments that run a `package.json` script. */
export function getRunScriptCommand(pm: string, script: string): [string, string[]] {
  const binary = getPackageManagerBinary(pm);
  return [binary, binary === 'npm' || binary === 'bun' ? ['run', script] : [script]];
}
