import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../cli.utils';
import registerCreateCommands from '../commands/create';

vi.mock('../cli.utils', () => ({
  createProgram: vi.fn(),
}));

vi.mock('../commands/create', () => ({ default: vi.fn() }));

describe('cli-without-project entrypoint', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.argv = ['node', 'node-red-dxp', '--help'];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('creates the program, registers the create command and parses argv', async () => {
    const fakeProgram = { parse: vi.fn() };
    vi.mocked(createProgram).mockReturnValue(fakeProgram as any);

    await import('../cli-without-project');

    expect(createProgram).toHaveBeenCalledWith('node-red-dxp CLI');
    expect(registerCreateCommands).toHaveBeenCalledWith(fakeProgram);
    expect(fakeProgram.parse).toHaveBeenCalledWith(process.argv);
  });
});
