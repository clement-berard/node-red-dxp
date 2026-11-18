import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import commandHandler from '../create.cli';

const { mockScaffold, mockRunCommand, mockAvailable } = vi.hoisted(() => ({
  mockScaffold: vi.fn(),
  mockRunCommand: vi.fn(),
  mockAvailable: vi.fn(),
}));

vi.mock('../scaffold', () => ({ scaffoldProject: mockScaffold, isFolderAvailable: mockAvailable }));
vi.mock('../../../utils/run-command', () => ({ runCommand: mockRunCommand }));
vi.mock('../../../ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../ui')>()),
  intro: vi.fn(),
  outro: vi.fn(),
  note: vi.fn(),
  canPrompt: () => false,
  withSpinner: (_label: string, _done: string, task: () => Promise<unknown>) => task(),
}));

describe('create command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockScaffold.mockResolvedValue([]);
    mockRunCommand.mockResolvedValue('');
    mockAvailable.mockReturnValue(true);
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  const run = async (args: string[]) => {
    const parent = new Command();
    commandHandler(parent);
    await parent.parseAsync(['create', ...args], { from: 'user' });
  };

  it('scaffolds, installs and builds with the given package manager', async () => {
    await run(['@me/node-red-contrib-x', '--pm', 'pnpm', '--editor', 'classic', '--node', 'first']);

    expect(mockScaffold).toHaveBeenCalledWith(
      expect.objectContaining({
        packageName: '@me/node-red-contrib-x',
        editor: 'classic',
        nodeName: 'first',
        pm: 'pnpm',
        ai: true,
      }),
    );
    expect(mockRunCommand).toHaveBeenNthCalledWith(1, 'pnpm', ['install'], expect.any(Object));
    expect(mockRunCommand).toHaveBeenNthCalledWith(2, 'pnpm', ['build'], expect.any(Object));
  });

  it('uses npm run for the build', async () => {
    await run(['x', '--pm', 'npm']);

    expect(mockRunCommand).toHaveBeenNthCalledWith(2, 'npm', ['run', 'build'], expect.any(Object));
  });

  it('honours --no-install and --no-ai', async () => {
    await run(['x', '--no-install', '--no-ai']);

    expect(mockRunCommand).not.toHaveBeenCalled();
    expect(mockScaffold).toHaveBeenCalledWith(expect.objectContaining({ ai: false, editor: 'svelte' }));
  });

  it('defaults the dxp version to the one of the CLI', async () => {
    await run(['x', '--no-install']);

    expect(mockScaffold).toHaveBeenCalledWith(expect.objectContaining({ dxpSpec: expect.stringMatching(/^\^\d+\./) }));
  });

  it('rejects an invalid package name', async () => {
    await run(['Bad Name', '--no-install']);

    expect(mockScaffold).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('rejects a folder that already has files', async () => {
    mockAvailable.mockReturnValue(false);

    await run(['x', '--no-install']);

    expect(mockScaffold).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });
});
