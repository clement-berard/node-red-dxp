import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  existsSyncMock,
  nodePlopMock,
  getLatestNpmPackageVersionMock,
  registerActionsMock,
  getPackageManagerMock,
  consolaMock,
} = vi.hoisted(() => ({
  existsSyncMock: vi.fn(),
  nodePlopMock: vi.fn(),
  getLatestNpmPackageVersionMock: vi.fn(),
  registerActionsMock: vi.fn(),
  getPackageManagerMock: vi.fn(),
  consolaMock: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

vi.mock('node:fs', () => ({ existsSync: existsSyncMock }));
vi.mock('node-plop', () => ({ default: nodePlopMock }));
vi.mock('../../../cli.utils', () => ({ getLatestNpmPackageVersion: getLatestNpmPackageVersionMock }));
vi.mock('../plop.actions', () => ({ registerActions: registerActionsMock }));
vi.mock('../utils', () => ({ getPackageManager: getPackageManagerMock }));
vi.mock('consola', () => ({ consola: consolaMock }));

function createFakePlop(overrides: { runPromptsResult?: any; runActionsResult?: any } = {}) {
  const generator = {
    runPrompts: vi.fn().mockResolvedValue(overrides.runPromptsResult ?? {}),
    runActions: vi.fn().mockResolvedValue(overrides.runActionsResult ?? { changes: [], failures: [] }),
  };
  const plop = {
    setGenerator: vi.fn(),
    getGenerator: vi.fn().mockReturnValue(generator),
  };
  return { plop, generator };
}

async function importHandleCreatePackage() {
  vi.resetModules();
  const mod = await import('../run');
  return mod.handleCreatePackage;
}

describe('handleCreatePackage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.DEV;
    existsSyncMock.mockReturnValue(true);
    getPackageManagerMock.mockReturnValue('pnpm');
    getLatestNpmPackageVersionMock.mockResolvedValue('2.0.0');
    vi.spyOn(process, 'cwd').mockReturnValue('/original/cwd');
    vi.spyOn(process, 'chdir').mockImplementation(() => undefined);
    // process.exit must halt execution like the real thing, otherwise the
    // consola.success()/return that follows it in the source would still run.
    vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      throw new Error(`process.exit(${code})`);
    }) as never);
  });

  it('throws when the templates directory does not exist and restores the original cwd', async () => {
    existsSyncMock.mockReturnValue(false);
    const { plop } = createFakePlop();
    nodePlopMock.mockResolvedValue(plop);

    const handleCreatePackage = await importHandleCreatePackage();

    await expect(handleCreatePackage('/target/dir')).rejects.toThrow('Templates directory not found:');

    expect(process.chdir).toHaveBeenNthCalledWith(1, '/target/dir');
    expect(process.chdir).toHaveBeenNthCalledWith(2, '/original/cwd');
  });

  it('registers the generator, builds the action list and runs it to completion', async () => {
    const { plop, generator } = createFakePlop({
      runActionsResult: { changes: [{ type: 'add', path: 'x' }], failures: [] },
    });
    nodePlopMock.mockResolvedValue(plop);

    const handleCreatePackage = await importHandleCreatePackage();
    const result = await handleCreatePackage('/target/dir');

    expect(registerActionsMock).toHaveBeenCalledWith(plop);
    expect(plop.setGenerator).toHaveBeenCalledWith(
      'project',
      expect.objectContaining({
        description: 'Generate a new Node.js project',
        prompts: expect.any(Array),
        actions: expect.any(Function),
      }),
    );

    const generatorConfig = plop.setGenerator.mock.calls[0][1];
    expect(generatorConfig.prompts.length).toBeGreaterThan(0);

    const answers = { projectName: 'demo-project', description: 'Demo', installDependencies: true };
    const actions = generatorConfig.actions(answers);

    const addActions = actions.filter((a: any) => a.type === 'add');
    expect(addActions).toHaveLength(6);
    expect(addActions[0]).toEqual({
      type: 'add',
      path: 'demo-project/package.json',
      templateFile: expect.stringContaining('package.json.hbs'),
      data: { ...answers, nrDXPLastVersion: '2.0.0' },
    });

    expect(actions.map((a: any) => a.type)).toEqual([
      'add',
      'add',
      'add',
      'add',
      'add',
      'add',
      'installDeps',
      'createConfigNode',
      'createRegularNode',
      'lint',
      'onSuccess',
    ]);
    expect(actions.at(-1)).toEqual({
      type: 'onSuccess',
      projectName: 'demo-project',
      currentPackageManager: 'pnpm',
    });

    expect(generator.runPrompts).toHaveBeenCalledTimes(1);
    expect(generator.runActions).toHaveBeenCalledWith({});
    expect(consolaMock.success).toHaveBeenCalledWith('✅ Project created successfully!');
    expect(result).toEqual({ changes: [{ type: 'add', path: 'x' }], failures: [] });
    expect(process.chdir).toHaveBeenNthCalledWith(1, '/target/dir');
    expect(process.chdir).toHaveBeenNthCalledWith(2, '/original/cwd');
  });

  it('omits the installDeps action when installDependencies is false', async () => {
    const { plop } = createFakePlop();
    nodePlopMock.mockResolvedValue(plop);

    const handleCreatePackage = await importHandleCreatePackage();
    await handleCreatePackage('/target/dir');

    const generatorConfig = plop.setGenerator.mock.calls[0][1];
    const actions = generatorConfig.actions({ projectName: 'demo', installDependencies: false });

    expect(actions.map((a: any) => a.type)).not.toContain('installDeps');
    expect(actions).toHaveLength(10);
  });

  it('logs failures and exits with code 1', async () => {
    const failures = [{ type: 'add', path: 'x', error: 'E', message: 'failed' }];
    const { plop } = createFakePlop({ runActionsResult: { changes: [], failures } });
    nodePlopMock.mockResolvedValue(plop);

    const handleCreatePackage = await importHandleCreatePackage();

    await expect(handleCreatePackage('/target/dir')).rejects.toThrow('process.exit(1)');

    expect(consolaMock.error).toHaveBeenCalledWith('❌ Failures:', failures);
    expect(process.chdir).toHaveBeenNthCalledWith(2, '/original/cwd');
  });

  it('uses canned dev-mode answers and empty prompts when DEV=true', async () => {
    process.env.DEV = 'true';
    const { plop, generator } = createFakePlop();
    nodePlopMock.mockResolvedValue(plop);

    const handleCreatePackage = await importHandleCreatePackage();
    await handleCreatePackage('/target/dir');

    const generatorConfig = plop.setGenerator.mock.calls[0][1];
    expect(generatorConfig.prompts).toEqual([]);

    const actions = generatorConfig.actions({ ignored: true });
    const addActions = actions.filter((a: any) => a.type === 'add');
    expect(addActions[0].path).toBe('my-project-test/package.json');
    expect(addActions[0].data.description).toBe('Test description');

    expect(generator.runActions).toHaveBeenCalled();
  });
});
