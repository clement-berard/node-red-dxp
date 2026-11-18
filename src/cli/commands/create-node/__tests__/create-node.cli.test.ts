import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import commandHandler, { resolveAnswers, validateNodeName } from '../create-node.cli';

const { mockCreateNode, mockNodeExists } = vi.hoisted(() => ({
  mockCreateNode: vi.fn(),
  mockNodeExists: vi.fn(),
}));

vi.mock('../../../../current-context', () => ({
  currentContext: { pathSrcNodesDir: '/project/src/nodes', currentDir: '/project', packageName: '@me/pkg' },
}));

vi.mock('../scaffolding', () => ({
  createNode: mockCreateNode,
  nodeExists: mockNodeExists,
  getDefaultCategory: () => 'pkg',
}));

vi.mock('../../../ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../ui')>()),
  intro: vi.fn(),
  outro: vi.fn(),
  log: { success: vi.fn(), message: vi.fn(), error: vi.fn() },
  canPrompt: () => false,
}));

describe('validateNodeName', () => {
  it('requires a name that gives a folder name', () => {
    expect(validateNodeName(undefined)).toBeDefined();
    expect(validateNodeName('   ')).toBeDefined();
    expect(validateNodeName('---')).toBeDefined();
    expect(validateNodeName('my node')).toBeUndefined();
  });
});

describe('resolveAnswers without a terminal', () => {
  it('defaults to a regular svelte node', async () => {
    expect(await resolveAnswers({ name: 'a' }, '/n')).toEqual({
      name: 'a',
      isConfigNode: false,
      editor: 'svelte',
      category: undefined,
    });
  });

  it('keeps what is given', async () => {
    expect(await resolveAnswers({ name: 'a', configNode: true, editor: 'classic' }, '/n')).toEqual({
      name: 'a',
      isConfigNode: true,
      editor: 'classic',
      category: undefined,
      color: undefined,
    });
  });

  it('rejects an invalid color', async () => {
    await expect(resolveAnswers({ name: 'a', color: 'red' }, '/n')).rejects.toThrow('Invalid color');
  });

  it('asks for the name when it cannot prompt', async () => {
    await expect(resolveAnswers({}, '/n')).rejects.toThrow('Missing node name');
  });

  it('rejects an invalid name', async () => {
    await expect(resolveAnswers({ name: '---' }, '/n')).rejects.toThrow('Invalid node name');
  });
});

describe('create-node command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateNode.mockResolvedValue([{ path: '/project/src/nodes/my-node/controller.ts', content: '' }]);
  });

  afterEach(() => {
    process.exitCode = undefined;
  });

  const run = async (args: string[]) => {
    const parent = new Command();
    commandHandler(parent);
    await parent.parseAsync(['create-node', ...args], { from: 'user' });
  };

  it('creates the node in src/nodes', async () => {
    await run(['--name', 'My Node', '--config-node', '--editor', 'classic']);

    expect(mockCreateNode).toHaveBeenCalledWith({
      nodesDir: '/project/src/nodes',
      name: 'My Node',
      packageName: '@me/pkg',
      isConfigNode: true,
      editor: 'classic',
      category: undefined,
      color: undefined,
    });
  });

  it('passes the category given on the command line', async () => {
    await run(['--name', 'x', '--category', 'mine']);

    expect(mockCreateNode).toHaveBeenCalledWith(expect.objectContaining({ category: 'mine' }));
  });

  it('accepts the former --skip-confirm flag', async () => {
    await run(['--name', 'x', '--regular-node', '--skip-confirm']);

    expect(mockCreateNode).toHaveBeenCalledWith(expect.objectContaining({ name: 'x', editor: 'svelte' }));
  });

  it('sets the error status when the node cannot be created', async () => {
    mockCreateNode.mockRejectedValue(new Error('Node x already exists'));

    await run(['--name', 'x']);

    expect(process.exitCode).toBe(1);
  });
});
