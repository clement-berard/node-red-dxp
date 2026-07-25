import { Command } from 'commander';
import { consola } from 'consola';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Builder } from '../../../../builder';
import commandHandler from '../build.cli';

const { mockBuildAll, mockSpinnerStart, mockSpinnerSucceed } = vi.hoisted(() => ({
  mockBuildAll: vi.fn(),
  mockSpinnerStart: vi.fn(),
  mockSpinnerSucceed: vi.fn(),
}));

vi.mock('../../../../current-context', () => ({
  currentContext: { listNodesFull: [{ id: 'node-a' }, { id: 'node-b' }] },
}));

vi.mock('../../../../builder', () => ({
  Builder: vi.fn().mockImplementation(function Builder() {
    return { buildAll: mockBuildAll };
  }),
}));

vi.mock('ora', () => ({
  default: vi.fn(() => ({ start: mockSpinnerStart })),
}));

vi.mock('consola', () => ({
  consola: { info: vi.fn() },
}));

describe('build.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBuildAll.mockResolvedValue(undefined);
    mockSpinnerStart.mockReturnValue({ succeed: mockSpinnerSucceed });
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

    expect(Builder).toHaveBeenCalledWith({ minify: true });
    expect(mockBuildAll).toHaveBeenCalledTimes(1);
    expect(mockSpinnerSucceed).toHaveBeenCalledTimes(1);
    expect(consola.info).toHaveBeenCalledWith('node-red-dxp builder');
  });

  it('disables minify when --no-minify is passed', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['build', '--no-minify'], { from: 'user' });

    expect(Builder).toHaveBeenCalledWith({ minify: false });
  });
});
