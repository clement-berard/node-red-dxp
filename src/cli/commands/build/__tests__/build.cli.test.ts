import { Command } from 'commander';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import commandHandler from '../build.cli';

const { mockBuild, mockSpinnerStart, mockSpinnerStop, mockIntro } = vi.hoisted(() => ({
  mockBuild: vi.fn(),
  mockSpinnerStart: vi.fn(),
  mockSpinnerStop: vi.fn(),
  mockIntro: vi.fn(),
}));

vi.mock('../../../../current-context', () => ({
  currentContext: { listNodesFull: [{ id: 'node-a' }, { id: 'node-b' }] },
}));

vi.mock('../../../../builder', () => ({
  build: mockBuild,
}));

vi.mock('../../../ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../ui')>()),
  intro: mockIntro,
  spinner: () => ({ start: mockSpinnerStart, stop: mockSpinnerStop, error: vi.fn() }),
}));

describe('build.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuild.mockResolvedValue(undefined);
  });

  it('registers the build command with the --no-minify option', () => {
    const parent = new Command();
    commandHandler(parent);

    const build = parent.commands.find((c) => c.name() === 'build');

    expect(build).toBeDefined();
    expect(build?.options.some((option) => option.long === '--no-minify')).toBe(true);
  });

  it('builds with minify enabled by default', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['build'], { from: 'user' });

    expect(mockBuild).toHaveBeenCalledWith({ minify: true });
    expect(mockSpinnerStop).toHaveBeenCalledTimes(1);
    expect(mockIntro).toHaveBeenCalledWith('node-red-dxp builder');
  });

  it('disables minify when --no-minify is passed', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['build', '--no-minify'], { from: 'user' });

    expect(mockBuild).toHaveBeenCalledWith({ minify: false });
  });
});
