import { Command } from 'commander';
import { consola } from 'consola';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import commandHandler from '../checks.cli';

vi.mock('consola', () => ({
  consola: { info: vi.fn() },
}));

describe('checks.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers nodes-structure and logs a WIP message when run', async () => {
    const parent = new Command();
    commandHandler(parent);

    // `.command('nodes-structure')` returns the child command, so the chained
    // `.action()`/`.description()` apply to it and it is the one re-attached
    // to parentCommand — 'nodes-structure' ends up as a top-level command.
    await parent.parseAsync(['nodes-structure'], { from: 'user' });

    expect(consola.info).toHaveBeenCalledWith('In construction');
  });
});
