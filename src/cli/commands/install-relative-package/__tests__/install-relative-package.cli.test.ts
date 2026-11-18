import fs from 'node:fs/promises';
import * as clack from '@clack/prompts';
import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveHomePath } from '../../../cli.utils';
import { log } from '../../../ui';
import { runCommand } from '../../../utils/run-command';
import commandHandler, { installLocalPackage } from '../install-relative-package.cli';

vi.mock('../../../../current-context', () => ({
  currentContext: { currentDir: '/default/project' },
  currentConfig: { watcher: { nodeRed: { userDir: '~/.node-red' } } },
}));

vi.mock('../../../cli.utils', () => ({
  resolveHomePath: vi.fn(),
}));

vi.mock('../../../utils/run-command', () => ({
  runCommand: vi.fn(),
}));

vi.mock('../../../ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../ui')>()),
  log: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  withSpinner: (_label: string, _done: string, task: () => Promise<unknown>) => task(),
}));

vi.mock('node:fs/promises', () => ({
  default: { access: vi.fn() },
}));

describe('installLocalPackage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveHomePath).mockReturnValue('/resolved/home/.node-red');
    vi.mocked(runCommand).mockResolvedValue('');
    vi.mocked(fs.access).mockResolvedValue(undefined);
  });

  it('uses currentContext/currentConfig defaults when no params are given', async () => {
    await installLocalPackage();

    expect(resolveHomePath).toHaveBeenCalledWith('~/.node-red');
    expect(fs.access).toHaveBeenCalledWith('/resolved/home/.node-red');
    expect(runCommand).toHaveBeenCalledWith('npm', ['install', '/default/project'], {
      cwd: '/resolved/home/.node-red',
    });
  });

  it('uses explicit params without touching resolveHomePath', async () => {
    await installLocalPackage({ pathToInstall: '/explicit/path', userDir: '/explicit/userDir' });

    expect(resolveHomePath).not.toHaveBeenCalled();
    expect(fs.access).toHaveBeenCalledWith('/explicit/userDir');
    expect(runCommand).toHaveBeenCalledWith('npm', ['install', '/explicit/path'], { cwd: '/explicit/userDir' });
  });

  it('propagates the runCommand error without swallowing it', async () => {
    const installError = new Error('npm install failed');
    vi.mocked(runCommand).mockRejectedValue(installError);

    await expect(installLocalPackage()).rejects.toBe(installError);
  });

  it('logs an error and returns early when userDir does not exist', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'));

    await installLocalPackage();

    expect(log.error).toHaveBeenCalledWith(
      'Node-RED userDir does not exist: /resolved/home/.node-red (run dev command to create it)',
    );
    expect(runCommand).not.toHaveBeenCalled();
  });
});

describe('install-relative-package.cli commandHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(resolveHomePath).mockReturnValue('/resolved/home/.node-red');
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  it('does not error out when the install succeeds', async () => {
    vi.mocked(runCommand).mockResolvedValue('');
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['install-local-package'], { from: 'user' });

    expect(log.error).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it('logs the error and exits with code 1 when the install fails', async () => {
    vi.spyOn(clack.log, 'error').mockImplementation(() => {});
    const installError = new Error('npm install failed');
    vi.mocked(runCommand).mockRejectedValue(installError);
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['install-local-package'], { from: 'user' });

    expect(clack.log.error).toHaveBeenCalledWith('npm install failed');
    expect(process.exitCode).toBe(1);
    process.exitCode = undefined;
  });
});
