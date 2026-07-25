import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import commandHandler from '../index';
import { handleCreatePackage } from '../run';

vi.mock('../run', () => ({
  handleCreatePackage: vi.fn(),
}));

describe('create/index.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(handleCreatePackage).mockResolvedValue({ changes: [], failures: [] });
  });

  it('registers the create command and delegates to handleCreatePackage', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['create'], { from: 'user' });

    expect(handleCreatePackage).toHaveBeenCalledTimes(1);
    expect(handleCreatePackage).toHaveBeenCalledWith();
  });
});
