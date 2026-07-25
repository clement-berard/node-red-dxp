import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildController } from '../buildController';
import { addCredentialsExportPlugin } from '../esbuild';

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  esbuildBuild: vi.fn(),
  listNodesFull: [] as Array<{ pascalName: string; fullControllerPath: string; name: string }>,
  redServerPath: [] as string[],
  includeInBundle: [] as string[],
}));

vi.mock('../../../current-context', () => ({
  currentContext: {
    currentDir: '/proj',
    get listNodesFull() {
      return mocks.listNodesFull;
    },
    get redServerPath() {
      return mocks.redServerPath;
    },
    config: {
      builder: {
        esbuildControllerOptions: {
          get includeInBundle() {
            return mocks.includeInBundle;
          },
        },
      },
    },
    cacheDirFiles: {
      controllerIndex: '/proj/.cache/controller-index.ts',
    },
    pathDist: '/proj/dist',
  },
}));

vi.mock('../../../tools/node-utils', () => ({
  writeFile: mocks.writeFile,
}));

vi.mock('node:fs/promises', () => ({
  default: {
    readFile: mocks.readFile,
  },
}));

vi.mock('esbuild', () => ({
  default: {
    build: mocks.esbuildBuild,
  },
}));

vi.mock('../esbuild', () => ({
  addCredentialsExportPlugin: {},
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.listNodesFull = [];
  mocks.redServerPath = [];
  mocks.includeInBundle = [];
  mocks.writeFile.mockResolvedValue(undefined);
  mocks.readFile.mockResolvedValue(JSON.stringify({ dependencies: {} }));
  mocks.esbuildBuild.mockResolvedValue(undefined);
});

describe('buildController', () => {
  it('generates one import + registerType line per node in listNodesFull', async () => {
    mocks.listNodesFull = [
      { pascalName: 'FooNode', fullControllerPath: '/proj/src/nodes/foo/controller.ts', name: 'foo-node' },
      { pascalName: 'BarNode', fullControllerPath: '/proj/src/nodes/bar/controller.ts', name: 'bar-node' },
    ];

    await buildController();

    const content = mocks.writeFile.mock.calls[0][1] as string;

    expect(content).toContain("import FooNode, {credentials as credFooNode} from '/proj/src/nodes/foo/controller.ts';");
    expect(content).toContain("import BarNode, {credentials as credBarNode} from '/proj/src/nodes/bar/controller.ts';");
    expect(content).toContain("global.RED.nodes.registerType('foo-node', FooNode, { credentials: credFooNode });");
    expect(content).toContain("global.RED.nodes.registerType('bar-node', BarNode, { credentials: credBarNode });");
  });

  it('omits RedServer import/call when redServerPath is empty', async () => {
    mocks.redServerPath = [];

    await buildController();

    const content = mocks.writeFile.mock.calls[0][1] as string;

    expect(content).not.toContain('RedServer');
  });

  it('includes RedServer import and call when redServerPath has an entry', async () => {
    mocks.redServerPath = ['/proj/src/red-server.ts'];

    await buildController();

    const content = mocks.writeFile.mock.calls[0][1] as string;

    expect(content).toContain("import RedServer from '/proj/src/red-server.ts';");
    expect(content).toContain('RedServer();');
  });

  it('calls esbuild.build with the expected static options and default minify:false', async () => {
    await buildController();

    expect(mocks.esbuildBuild).toHaveBeenCalledWith(
      expect.objectContaining({
        entryPoints: ['/proj/.cache/controller-index.ts'],
        outfile: '/proj/dist/index.js',
        bundle: true,
        minify: false,
        platform: 'node',
        format: 'cjs',
        target: 'es2018',
        loader: { '.ts': 'ts' },
        packages: 'bundle',
        plugins: [addCredentialsExportPlugin],
      }),
    );
  });

  it('propagates minify:true to esbuild.build', async () => {
    await buildController({ minify: true });

    expect(mocks.esbuildBuild).toHaveBeenCalledWith(expect.objectContaining({ minify: true }));
  });

  it('excludes includeInBundle deps from the computed externals', async () => {
    mocks.includeInBundle = ['@keload/node-red-dxp'];
    mocks.readFile.mockResolvedValue(
      JSON.stringify({ dependencies: { 'dep-a': '1.0.0', 'dep-b': '1.0.0', '@keload/node-red-dxp': '1.0.0' } }),
    );

    await buildController();

    expect(mocks.esbuildBuild).toHaveBeenCalledWith(expect.objectContaining({ external: ['dep-a', 'dep-b'] }));
  });

  it('does not throw with zero nodes in listNodesFull', async () => {
    mocks.listNodesFull = [];

    await buildController();

    const content = mocks.writeFile.mock.calls[0][1] as string;
    expect(content).toContain('export default async (RED: NodeAPI): Promise<void> => {');
  });
});
