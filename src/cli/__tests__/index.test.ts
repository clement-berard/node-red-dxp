import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}));

describe('cli entrypoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    vi.spyOn(process, 'on').mockImplementation(() => process);
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    vi.spyOn(process, 'chdir').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('chdirs into the matching project dir and attempts to load cli-with-project when a package.json depends on this package', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/repo/project');
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ dependencies: { '@keload/node-red-dxp': '^1.0.0' } }));

    // require('./cli-with-project') can't resolve a raw .ts module outside of the bundler,
    // so we only assert isInProject's own behaviour (chdir + which module it targets).
    await expect(import('../index')).rejects.toThrow(/cli-with-project/);

    expect(process.chdir).toHaveBeenCalledWith('/repo/project');
  });

  it('attempts to load cli-without-project when no ancestor package.json depends on this package', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/a/b/c');
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    await expect(import('../index')).rejects.toThrow(/cli-without-project/);

    expect(process.chdir).not.toHaveBeenCalled();
  });

  it('registers SIGINT and SIGTERM handlers that exit the process with code 0', async () => {
    vi.spyOn(process, 'cwd').mockReturnValue('/a/b/c');
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    await import('../index').catch(() => {});

    const onMock = vi.mocked(process.on);
    const sigintCall = onMock.mock.calls.find((call) => call[0] === 'SIGINT');
    const sigtermCall = onMock.mock.calls.find((call) => call[0] === 'SIGTERM');

    expect(sigtermCall).toBeDefined();

    if (!sigintCall) {
      throw new Error('SIGINT handler was not registered');
    }

    const sigintHandler = sigintCall[1] as () => void;
    sigintHandler();
    expect(process.exit).toHaveBeenCalledWith(0);
  });
});
