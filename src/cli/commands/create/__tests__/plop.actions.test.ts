import path from 'node:path';
import { consola } from 'consola';
import type { NodePlopAPI } from 'plop';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runCommand } from '../../../utils/run-command';
import {
  createConfigNodeAction,
  createRegularNodeAction,
  installDepsAction,
  lintAction,
  onSuccessAction,
  registerActions,
} from '../plop.actions';
import { getPackageManager } from '../utils';

vi.mock('../../../utils/run-command', () => ({
  runCommand: vi.fn(),
}));

vi.mock('../utils', () => ({
  getPackageManager: vi.fn(),
}));

vi.mock('consola', () => ({
  consola: { box: vi.fn() },
}));

const projectPath = path.resolve(process.cwd(), 'my-project');

describe('plop.actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getPackageManager).mockReturnValue('pnpm');
    vi.mocked(runCommand).mockResolvedValue('');
  });

  it('installDepsAction installs dependencies through the detected package manager', async () => {
    const result = await installDepsAction({}, { projectName: 'my-project' } as any, {} as any);

    expect(runCommand).toHaveBeenCalledWith('pnpm', ['install'], { cwd: projectPath, stdio: 'inherit' });
    expect(result).toBe('✓ Dependencies installed');
  });

  it('lintAction runs biome migrate then lint:check and returns the final message', async () => {
    const result = await lintAction({}, { projectName: 'my-project' } as any, {} as any);

    expect(runCommand).toHaveBeenNthCalledWith(1, 'pnpm', ['biome', 'migrate', '--write'], {
      cwd: projectPath,
      stdio: 'inherit',
    });
    expect(runCommand).toHaveBeenNthCalledWith(2, 'pnpm', ['lint:check', '--write'], {
      cwd: projectPath,
      stdio: 'inherit',
    });
    expect(result).toBe('✓ Lint check completed');
  });

  it('createConfigNodeAction scaffolds a config node', async () => {
    const result = await createConfigNodeAction({}, { projectName: 'my-project' } as any, {} as any);

    expect(runCommand).toHaveBeenCalledWith(
      'pnpm',
      ['node-red-dxp', 'create-node', '--name', 'my-config-node', '--config-node', '--skip-confirm'],
      { cwd: projectPath, stdio: 'inherit' },
    );
    expect(result).toBe('✓ Config Node completed');
  });

  it('createRegularNodeAction scaffolds a regular node', async () => {
    const result = await createRegularNodeAction({}, { projectName: 'my-project' } as any, {} as any);

    expect(runCommand).toHaveBeenCalledWith(
      'pnpm',
      ['node-red-dxp', 'create-node', '--name', 'my-node', '--regular-node', '--skip-confirm'],
      { cwd: projectPath, stdio: 'inherit' },
    );
    expect(result).toBe('✓ Regular Node completed');
  });

  it('onSuccessAction prints the next-steps box and returns an empty string', async () => {
    const result = await onSuccessAction(
      {},
      { projectName: 'my-project', currentPackageManager: 'pnpm' } as any,
      {} as any,
    );

    expect(consola.box).toHaveBeenCalledWith('cd my-project\npnpm dev');
    expect(result).toBe('');
  });

  it('rejects when projectName is missing', async () => {
    await expect(installDepsAction({}, {} as any, {} as any)).rejects.toThrow('projectName is required');
    expect(runCommand).not.toHaveBeenCalled();
  });

  it('registerActions wires every action type onto the plop instance', () => {
    const plop = { setActionType: vi.fn() } as unknown as NodePlopAPI;

    registerActions(plop);

    expect(plop.setActionType).toHaveBeenCalledTimes(5);
    expect(plop.setActionType).toHaveBeenCalledWith('installDeps', installDepsAction);
    expect(plop.setActionType).toHaveBeenCalledWith('lint', lintAction);
    expect(plop.setActionType).toHaveBeenCalledWith('createConfigNode', createConfigNodeAction);
    expect(plop.setActionType).toHaveBeenCalledWith('createRegularNode', createRegularNodeAction);
    expect(plop.setActionType).toHaveBeenCalledWith('onSuccess', onSuccessAction);
  });
});
