import { beforeEach, describe, expect, it, vi } from 'vitest';
import { build } from '../build';

const mocks = vi.hoisted(() => ({
  createFolderIfNotExists: vi.fn(),
  cleanPaths: vi.fn(),
  writeFile: vi.fn(),
  copyFile: vi.fn(),
  cp: vi.fn(),
  buildController: vi.fn(),
  buildEditor: vi.fn(),
  writeAllLocales: vi.fn(),
}));

vi.mock('../../current-context', () => ({
  currentContext: {
    pathLibCacheDir: '/proj/.cache',
    pathDist: '/proj/dist',
    currentPackagedDistPath: '/proj/packaged',
    config: { some: 'config-value' },
  },
}));

vi.mock('../../tools/node-utils', () => ({
  createFolderIfNotExists: mocks.createFolderIfNotExists,
  cleanPaths: mocks.cleanPaths,
  writeFile: mocks.writeFile,
}));

vi.mock('node:fs/promises', () => ({
  default: {
    copyFile: mocks.copyFile,
    cp: mocks.cp,
  },
}));

vi.mock('../controller/buildController', () => ({
  buildController: mocks.buildController,
}));

vi.mock('../editor/buildEditor', () => ({
  buildEditor: mocks.buildEditor,
}));

vi.mock('../locales/writeLocales', () => ({
  writeAllLocales: mocks.writeAllLocales,
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.cleanPaths.mockResolvedValue(undefined);
  mocks.writeFile.mockResolvedValue(undefined);
  mocks.copyFile.mockResolvedValue(undefined);
  mocks.cp.mockResolvedValue(undefined);
  mocks.buildController.mockResolvedValue(undefined);
  mocks.buildEditor.mockResolvedValue(undefined);
  mocks.writeAllLocales.mockResolvedValue(undefined);
});

describe('build', () => {
  it('calls createFolderIfNotExists(pathLibCacheDir) before cleanPaths([pathDist])', async () => {
    const order: string[] = [];
    mocks.createFolderIfNotExists.mockImplementation((p: string) => {
      order.push(`create:${p}`);
    });
    mocks.cleanPaths.mockImplementation((paths: string[]) => {
      order.push(`clean:${paths.join(',')}`);
      return Promise.resolve();
    });

    await build();

    const createLibCacheIdx = order.indexOf('create:/proj/.cache');
    const cleanIdx = order.indexOf('clean:/proj/dist');
    expect(createLibCacheIdx).toBeGreaterThanOrEqual(0);
    expect(cleanIdx).toBeGreaterThanOrEqual(0);
    expect(createLibCacheIdx).toBeLessThan(cleanIdx);
  });

  it('calls createFolderIfNotExists(pathDist) only after writeFile/copyFile/cp all resolve', async () => {
    const order: string[] = [];
    mocks.createFolderIfNotExists.mockImplementation((p: string) => {
      order.push(`create:${p}`);
    });
    mocks.writeFile.mockImplementation(() => Promise.resolve().then(() => order.push('write:config')));
    mocks.copyFile.mockImplementation(() => Promise.resolve().then(() => order.push('copy:pug-helper')));
    mocks.cp.mockImplementation(() => Promise.resolve().then(() => order.push('cp:pug')));

    await build();

    const createDistIdx = order.indexOf('create:/proj/dist');
    expect(createDistIdx).toBeGreaterThan(order.indexOf('write:config'));
    expect(createDistIdx).toBeGreaterThan(order.indexOf('copy:pug-helper'));
    expect(createDistIdx).toBeGreaterThan(order.indexOf('cp:pug'));
  });

  it('writes the config file with the stringified config', async () => {
    await build();

    expect(mocks.writeFile).toHaveBeenCalledWith(
      '/proj/.cache/config.json',
      JSON.stringify({ some: 'config-value' }, null, 2),
    );
  });

  it('copies pug-helper and pug assets from currentPackagedDistPath', async () => {
    await build();

    expect(mocks.copyFile).toHaveBeenCalledWith(
      '/proj/packaged/editor/assets/pug-helper.pug',
      '/proj/.cache/pug-helper.pug',
    );
    expect(mocks.cp).toHaveBeenCalledWith('/proj/packaged/editor/assets/pug', '/proj/.cache/pug', { recursive: true });
  });

  it('defaults minify to false and propagates it to buildController/buildEditor', async () => {
    await build();

    expect(mocks.buildController).toHaveBeenCalledWith({ minify: false });
    expect(mocks.buildEditor).toHaveBeenCalledWith({ minify: false });
  });

  it('propagates minify:true to buildController/buildEditor', async () => {
    await build({ minify: true });

    expect(mocks.buildController).toHaveBeenCalledWith({ minify: true });
    expect(mocks.buildEditor).toHaveBeenCalledWith({ minify: true });
  });

  it('runs buildController, buildEditor and writeAllLocales genuinely concurrently', async () => {
    const dController = createDeferred<void>();
    const dEditor = createDeferred<void>();
    const dLocales = createDeferred<void>();

    mocks.buildController.mockImplementation(() => dController.promise);
    mocks.buildEditor.mockImplementation(() => dEditor.promise);
    mocks.writeAllLocales.mockImplementation(() => dLocales.promise);

    const buildPromise = build();

    // flush pending microtasks (and a macrotask) from `prepare()` without resolving
    // the three deferred promises above.
    await new Promise((r) => setTimeout(r, 0));

    expect(mocks.buildController).toHaveBeenCalledTimes(1);
    expect(mocks.buildEditor).toHaveBeenCalledTimes(1);
    expect(mocks.writeAllLocales).toHaveBeenCalledTimes(1);

    dController.resolve(undefined);
    dEditor.resolve(undefined);
    dLocales.resolve(undefined);

    await buildPromise;
  });
});
