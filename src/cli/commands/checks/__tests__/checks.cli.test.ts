import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { log } from '../../../ui';
import commandHandler from '../checks.cli';

vi.mock('../../../ui', () => ({ log: { info: vi.fn() } }));

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

    expect(log.info).toHaveBeenCalledWith('In construction');
  });
});
