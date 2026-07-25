import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProgram } from '../cli.utils';
import registerBuildCommands from '../commands/build/build.cli';
import registerChecksCommands from '../commands/checks/checks.cli';
import registerScaffoldingCommands from '../commands/create-node/create-node.cli';
import registerInfoCommands from '../commands/info/info.cli';
import registerInstallRelativePackageCommands from '../commands/install-relative-package/install-relative-package.cli';
import registerWatchCommands from '../commands/watch/watch.cli';

vi.mock('../cli.utils', () => ({
  createProgram: vi.fn(),
}));

vi.mock('../commands/build/build.cli', () => ({ default: vi.fn() }));
vi.mock('../commands/checks/checks.cli', () => ({ default: vi.fn() }));
vi.mock('../commands/create-node/create-node.cli', () => ({ default: vi.fn() }));
vi.mock('../commands/info/info.cli', () => ({ default: vi.fn() }));
vi.mock('../commands/install-relative-package/install-relative-package.cli', () => ({ default: vi.fn() }));
vi.mock('../commands/watch/watch.cli', () => ({ default: vi.fn() }));

describe('cli-with-project entrypoint', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.argv = ['node', 'node-red-dxp', '--help'];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('creates the program, registers every command and parses argv', async () => {
    const fakeProgram = { parse: vi.fn() };
    vi.mocked(createProgram).mockReturnValue(fakeProgram as any);

    await import('../cli-with-project');

    expect(createProgram).toHaveBeenCalledWith('node-red-dxp CLI');
    expect(registerBuildCommands).toHaveBeenCalledWith(fakeProgram);
    expect(registerWatchCommands).toHaveBeenCalledWith(fakeProgram);
    expect(registerInfoCommands).toHaveBeenCalledWith(fakeProgram);
    expect(registerChecksCommands).toHaveBeenCalledWith(fakeProgram);
    expect(registerScaffoldingCommands).toHaveBeenCalledWith(fakeProgram);
    expect(registerInstallRelativePackageCommands).toHaveBeenCalledWith(fakeProgram);
    expect(fakeProgram.parse).toHaveBeenCalledWith(process.argv);
  });
});
