import { Command } from 'commander';
import { consola } from 'consola';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createFolderIfNotExists } from '../../../../tools/node-utils';
import commandHandler from '../create-node.cli';
import { createScaffoldingContext, distFolderExist, writeNewNode } from '../scaffolding';

const fakeContext = {
  nodePascalName: 'TestNode',
  nodeDashName: 'test-node',
  newNodeDistPath: '/project/src/nodes/test-node',
  newNodeEditorDistPath: '/project/src/nodes/test-node/editor',
  scaffoldedDistHbs: '/project/dist/scaffolding/create-node/hbs',
  isConfigNode: false,
};

vi.mock('../scaffolding', () => ({
  createScaffoldingContext: vi.fn(),
  distFolderExist: vi.fn(),
  writeNewNode: vi.fn(),
}));

vi.mock('../../../../tools/node-utils', () => ({
  createFolderIfNotExists: vi.fn(),
}));

vi.mock('consola', () => ({
  consola: { prompt: vi.fn(), info: vi.fn(), error: vi.fn() },
}));

describe('create-node.cli', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createScaffoldingContext).mockReturnValue(fakeContext);
    vi.mocked(distFolderExist).mockReturnValue(false);
    vi.mocked(writeNewNode).mockResolvedValue(undefined);
  });

  it('skips both prompts when name and node type are given as flags', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['create-node', '--name', 'My Node', '--skip-confirm', '--regular-node'], {
      from: 'user',
    });

    expect(consola.prompt).not.toHaveBeenCalled();
    expect(createScaffoldingContext).toHaveBeenCalledWith({ innerNodeName: 'my-node', isConfigNode: false });
    expect(createFolderIfNotExists).toHaveBeenCalledWith(fakeContext.newNodeEditorDistPath);
    expect(writeNewNode).toHaveBeenCalledWith(fakeContext);
  });

  it('resolves isConfigNode to true from --config-node without prompting', async () => {
    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['create-node', '--name', 'my-node', '--skip-confirm', '--config-node'], {
      from: 'user',
    });

    expect(createScaffoldingContext).toHaveBeenCalledWith({ innerNodeName: 'my-node', isConfigNode: true });
  });

  it('prompts for the node name when --name is not provided', async () => {
    vi.mocked(consola.prompt).mockResolvedValueOnce('typed name');

    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['create-node', '--skip-confirm', '--regular-node'], { from: 'user' });

    expect(consola.prompt).toHaveBeenCalledWith('Enter node name:', { type: 'text' });
    expect(createScaffoldingContext).toHaveBeenCalledWith({ innerNodeName: 'typed-name', isConfigNode: false });
  });

  it('exits without scaffolding when the user rejects the confirmation prompt', async () => {
    vi.mocked(consola.prompt).mockResolvedValueOnce(false);

    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['create-node', '--name', 'test-node'], { from: 'user' });

    expect(consola.info).toHaveBeenCalledWith('👌 OK. Exiting...');
    expect(createScaffoldingContext).not.toHaveBeenCalled();
    expect(writeNewNode).not.toHaveBeenCalled();
  });

  it('prompts for the node type when neither --config-node nor --regular-node is given', async () => {
    vi.mocked(consola.prompt).mockResolvedValueOnce(true).mockResolvedValueOnce(true);

    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['create-node', '--name', 'test-node'], { from: 'user' });

    expect(consola.prompt).toHaveBeenCalledWith(`This name is OK for you 'test-node'?`, { type: 'confirm' });
    expect(consola.prompt).toHaveBeenCalledWith('Is this a config node?', { type: 'confirm' });
    expect(createScaffoldingContext).toHaveBeenCalledWith({ innerNodeName: 'test-node', isConfigNode: true });
  });

  it('reports an error and does not scaffold when the dist folder already exists', async () => {
    vi.mocked(distFolderExist).mockReturnValue(true);

    const parent = new Command();
    commandHandler(parent);

    await parent.parseAsync(['create-node', '--name', 'test-node', '--skip-confirm', '--regular-node'], {
      from: 'user',
    });

    expect(consola.error).toHaveBeenCalledWith(`Node ${fakeContext.nodeDashName} already exists`);
    expect(consola.info).toHaveBeenCalledWith(`In ${fakeContext.newNodeDistPath}`);
    expect(createFolderIfNotExists).not.toHaveBeenCalled();
    expect(writeNewNode).not.toHaveBeenCalled();
  });
});
