import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import commandHandler from '../watch.cli';
import { runWatcher } from '../watcher';

vi.mock('../watcher', () => ({
  runWatcher: vi.fn(),
}));

describe('watch.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers the watch command with --minify defaulting to false', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['watch'], { from: 'user' });

    expect(runWatcher).toHaveBeenCalledWith({ minify: false });
  });

  it('enables minify when --minify is passed', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['watch', '--minify'], { from: 'user' });

    expect(runWatcher).toHaveBeenCalledWith({ minify: true });
  });
});
