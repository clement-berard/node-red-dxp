import { type SpawnOptions, spawn } from 'node:child_process';

export type RunCommandOptions = {
  cwd?: string;
  stdio?: SpawnOptions['stdio'];
};

export function runCommand(cmd: string, args: string[] = [], options: RunCommandOptions = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    let stdout = '';
    const child = spawn(cmd, args, {
      cwd: options.cwd,
      stdio: options.stdio ?? 'pipe',
    });

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed: ${cmd} ${args.join(' ')} (exit code ${code})`));
      } else {
        resolve(stdout);
      }
    });
  });
}
