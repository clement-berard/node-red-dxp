import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runCommand } from '../run-command';

vi.mock('node:child_process', () => ({
  spawn: vi.fn(),
}));

function createFakeChild() {
  const child = new EventEmitter() as EventEmitter & { stdout: EventEmitter };
  child.stdout = new EventEmitter();
  return child;
}

describe('runCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('resolves with concatenated stdout when the process exits with code 0', async () => {
    const child = createFakeChild();
    vi.mocked(spawn).mockReturnValue(child as any);

    const promise = runCommand('echo', ['hello']);
    child.stdout.emit('data', Buffer.from('hel'));
    child.stdout.emit('data', Buffer.from('lo'));
    child.emit('close', 0);

    await expect(promise).resolves.toBe('hello');
  });

  it('rejects with an explicit error when the process exits with a non-zero code', async () => {
    const child = createFakeChild();
    vi.mocked(spawn).mockReturnValue(child as any);

    const promise = runCommand('false-cmd', ['--flag']);
    child.emit('close', 2);

    await expect(promise).rejects.toThrow('Command failed: false-cmd --flag (exit code 2)');
  });

  it('rejects when the child process emits an error event', async () => {
    const child = createFakeChild();
    vi.mocked(spawn).mockReturnValue(child as any);
    const err = new Error('spawn ENOENT');

    const promise = runCommand('missing-cmd');
    child.emit('error', err);

    await expect(promise).rejects.toBe(err);
  });

  it('passes cwd and the default pipe stdio to spawn', async () => {
    const child = createFakeChild();
    vi.mocked(spawn).mockReturnValue(child as any);

    const promise = runCommand('npm', ['install'], { cwd: '/tmp/project' });
    child.emit('close', 0);
    await promise;

    expect(spawn).toHaveBeenCalledWith('npm', ['install'], { cwd: '/tmp/project', stdio: 'pipe' });
  });

  it('passes a custom stdio option through to spawn', async () => {
    const child = createFakeChild();
    vi.mocked(spawn).mockReturnValue(child as any);

    const promise = runCommand('npm', ['install'], { stdio: 'inherit' });
    child.emit('close', 0);
    await promise;

    expect(spawn).toHaveBeenCalledWith('npm', ['install'], { cwd: undefined, stdio: 'inherit' });
  });

  it('defaults args to an empty array', async () => {
    const child = createFakeChild();
    vi.mocked(spawn).mockReturnValue(child as any);

    const promise = runCommand('node-red');
    child.emit('close', 0);
    await promise;

    expect(spawn).toHaveBeenCalledWith('node-red', [], { cwd: undefined, stdio: 'pipe' });
  });
});
