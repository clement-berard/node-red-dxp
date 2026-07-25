import { existsSync } from 'node:fs';
import chokidar from 'chokidar';
import { consola } from 'consola';
import nodemon from 'nodemon';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Builder } from '../../../../builder';
import { runCommand } from '../../../utils/run-command';
import { installLocalPackage } from '../../install-relative-package/install-relative-package.cli';
import { runWatcher } from '../watcher';

const {
  currentContextMock,
  chokidarWatchMock,
  chokidarHandlers,
  nodemonFn,
  nodemonHandlers,
  mockNodemonRestart,
  browserSyncCreateMock,
  mockBsInit,
  mockBsReload,
  mockBuildAll,
} = vi.hoisted(() => {
  const chokidarHandlers: Record<string, (...args: any[]) => any> = {};
  const chokidarWatcherObj: any = {};
  chokidarWatcherObj.on = vi.fn((event: string, cb: any) => {
    chokidarHandlers[event] = cb;
    return chokidarWatcherObj;
  });
  const chokidarWatchMock = vi.fn(() => chokidarWatcherObj);

  const nodemonHandlers: Record<string, (...args: any[]) => any> = {};
  const mockNodemonRestart = vi.fn();
  const nodemonFn: any = vi.fn(() => ({ restart: mockNodemonRestart }));
  nodemonFn.once = vi.fn((event: string, cb: any) => {
    nodemonHandlers[event] = cb;
    return nodemonFn;
  });
  nodemonFn.on = vi.fn((event: string, cb: any) => {
    nodemonHandlers[event] = cb;
    return nodemonFn;
  });

  const mockBsInit = vi.fn();
  const mockBsReload = vi.fn();
  const browserSyncCreateMock = vi.fn(() => ({ init: mockBsInit, reload: mockBsReload }));

  const mockBuildAll = vi.fn();

  const currentContextMock = {
    pathSrcDir: '/project/src',
    currentDir: '/project',
    pathLibCacheDir: '/project/.node-red-dxp',
    config: {
      watcher: {
        enabled: true,
        nodeRed: {
          executable: '/usr/local/bin/node-red',
          userDir: '/home/user/.node-red',
          url: 'http://localhost:1880',
        },
        browserSync: {
          host: 'localhost',
          port: 3000,
          open: false,
          reloadDelay: 500,
        },
      },
    },
  };

  return {
    currentContextMock,
    chokidarWatchMock,
    chokidarHandlers,
    nodemonFn,
    nodemonHandlers,
    mockNodemonRestart,
    browserSyncCreateMock,
    mockBsInit,
    mockBsReload,
    mockBuildAll,
  };
});

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
}));

vi.mock('chokidar', () => ({
  default: { watch: chokidarWatchMock },
}));

vi.mock('nodemon', () => ({
  default: nodemonFn,
}));

vi.mock('browser-sync', () => ({
  default: { create: browserSyncCreateMock },
}));

vi.mock('../../../../builder', () => ({
  Builder: vi.fn().mockImplementation(function Builder() {
    return { buildAll: mockBuildAll };
  }),
}));

vi.mock('../../../../current-context', () => ({
  currentContext: currentContextMock,
}));

vi.mock('../../../utils/run-command', () => ({
  runCommand: vi.fn(),
}));

vi.mock('../../install-relative-package/install-relative-package.cli', () => ({
  installLocalPackage: vi.fn(),
}));

vi.mock('consola', () => ({
  consola: { info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

function resetCurrentContext() {
  currentContextMock.pathSrcDir = '/project/src';
  currentContextMock.currentDir = '/project';
  currentContextMock.pathLibCacheDir = '/project/.node-red-dxp';
  currentContextMock.config.watcher.enabled = true;
  currentContextMock.config.watcher.nodeRed.executable = '/usr/local/bin/node-red';
  currentContextMock.config.watcher.nodeRed.userDir = '/home/user/.node-red';
  currentContextMock.config.watcher.nodeRed.url = 'http://localhost:1880';
  currentContextMock.config.watcher.browserSync.host = 'localhost';
  currentContextMock.config.watcher.browserSync.port = 3000;
  currentContextMock.config.watcher.browserSync.open = false;
  currentContextMock.config.watcher.browserSync.reloadDelay = 500;
}

describe('runWatcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetCurrentContext();
    mockBuildAll.mockResolvedValue(undefined);
    vi.mocked(runCommand).mockResolvedValue('v3.1.0');
    vi.mocked(installLocalPackage).mockResolvedValue(undefined);
    vi.mocked(existsSync).mockReturnValue(true);
    // process.exit must halt execution like the real thing, otherwise code after
    // the exit() call in the source (e.g. nodemon() further down) would still run.
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
  });

  it('builds and warns without starting nodemon when the node-red watcher is disabled', async () => {
    currentContextMock.config.watcher.enabled = false;

    runWatcher();
    await chokidarHandlers.ready();

    expect(chokidar.watch).toHaveBeenCalledWith('/project/src', {});
    expect(Builder).toHaveBeenCalledWith({ minify: false });
    expect(mockBuildAll).toHaveBeenCalledTimes(1);
    expect(consola.success).toHaveBeenCalledWith('Initial Build completed');
    expect(consola.warn).toHaveBeenCalledWith('Node-Red watcher is disabled. Please enable it in the config file');
    expect(nodemon).not.toHaveBeenCalled();
  });

  it('starts nodemon on ready when the watcher is enabled', async () => {
    runWatcher({ minify: true });
    await chokidarHandlers.ready();

    expect(Builder).toHaveBeenCalledWith({ minify: true });
    expect(nodemon).toHaveBeenCalledWith(
      expect.objectContaining({ exec: '/usr/local/bin/node-red -u /home/user/.node-red' }),
    );
    expect(nodemonFn.once).toHaveBeenCalledWith('start', expect.any(Function));
    expect(nodemonFn.on).toHaveBeenCalledWith('quit', expect.any(Function));
  });

  it('rebuilds and restarts nodemon/browser-sync on change', async () => {
    runWatcher();
    await chokidarHandlers.ready();
    await nodemonHandlers.start();

    await chokidarHandlers.change('/project/src/nodes/my-node/controller.ts');

    expect(mockBuildAll).toHaveBeenCalledTimes(2);
    expect(consola.success).toHaveBeenCalledWith('Build completed');
    expect(mockNodemonRestart).toHaveBeenCalledTimes(1);
    expect(mockBsReload).toHaveBeenCalledTimes(1);
  });

  it('errors out and exits when the local node-red executable is not installed', async () => {
    currentContextMock.config.watcher.nodeRed.executable = 'package';
    vi.mocked(existsSync).mockReturnValue(false);

    runWatcher();

    await expect(chokidarHandlers.ready()).rejects.toThrow('process.exit(1)');
    expect(consola.error).toHaveBeenCalledWith(expect.stringContaining('Local Node-RED executable not found at:'));
    expect(nodemon).not.toHaveBeenCalled();
  });

  it('logs the node-red version and initializes browser-sync on nodemon start', async () => {
    runWatcher();
    await chokidarHandlers.ready();
    await nodemonHandlers.start();

    expect(runCommand).toHaveBeenCalledWith('/usr/local/bin/node-red', ['--version']);
    expect(consola.info).toHaveBeenCalledWith('node-red instance', {
      executable: '/usr/local/bin/node-red',
      userDir: '/home/user/.node-red',
      nodeRedVersion: 'v3.1.0',
    });
    expect(mockBsInit).toHaveBeenCalledWith(
      expect.objectContaining({
        proxy: { target: 'http://localhost:1880', ws: true },
        host: 'localhost',
        port: 3000,
      }),
    );
  });

  it('restarts nodemon after successfully installing the local package', async () => {
    currentContextMock.config.watcher.nodeRed.executable = 'package';

    runWatcher();
    await chokidarHandlers.ready();
    await nodemonHandlers.start();

    expect(installLocalPackage).toHaveBeenCalledWith({
      pathToInstall: '/project',
      userDir: '/project/.node-red-dxp/.node-red-local',
    });
    expect(mockNodemonRestart).toHaveBeenCalledTimes(1);
    expect(consola.error).not.toHaveBeenCalled();
  });

  it('logs the error and does not restart nodemon when the local package install fails', async () => {
    currentContextMock.config.watcher.nodeRed.executable = 'package';
    const installError = new Error('npm install failed');
    vi.mocked(installLocalPackage).mockRejectedValue(installError);

    runWatcher();
    await chokidarHandlers.ready();
    await nodemonHandlers.start();

    expect(consola.error).toHaveBeenCalledWith('Error while installing local package:', installError);
    expect(mockNodemonRestart).not.toHaveBeenCalled();
    expect(mockBsInit).toHaveBeenCalledTimes(1);
  });

  it('exits the process when nodemon quits', async () => {
    runWatcher();
    await chokidarHandlers.ready();

    expect(() => nodemonHandlers.quit()).toThrow('process.exit(0)');
    expect(consola.info).toHaveBeenCalledWith('Nodemon has quit');
  });
});
