import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { computeNodeName } from '../../../../tools/common-utils';
import { writeFile } from '../../../../tools/node-utils';
import {
  createScaffoldingContext,
  distFolderExist,
  prepareStructure,
  renderFilesTemplates,
  renderTemplate,
  type ScaffoldingContext,
  writeNewNode,
} from '../scaffolding';

const { mockReadFile, mockExistsSync } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockExistsSync: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  default: { readFile: mockReadFile },
  readFile: mockReadFile,
}));

vi.mock('node:fs', () => ({
  default: { existsSync: mockExistsSync },
  existsSync: mockExistsSync,
}));

vi.mock('../../../../current-context', () => ({
  currentContext: {
    pathSrcNodesDir: '/project/src/nodes',
    currentPackagedDistPath: '/project/dist',
  },
}));

vi.mock('../../../../tools/node-utils', () => ({
  writeFile: vi.fn(),
}));

describe('renderTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads the template file and renders it with handlebars', async () => {
    mockReadFile.mockResolvedValue('Hello {{name}}!');

    const result = await renderTemplate('/templates/greeting.hbs', { name: 'World' });

    expect(result).toBe('Hello World!');
  });

  it('wraps a file read Error with a descriptive message', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT: no such file'));

    await expect(renderTemplate('/templates/missing.hbs', {})).rejects.toThrow(
      'Failed to load file: ENOENT: no such file',
    );
  });

  it('propagates a non-Error rejection as-is', async () => {
    mockReadFile.mockRejectedValue('not-an-error');

    await expect(renderTemplate('/templates/missing.hbs', {})).rejects.toBe('not-an-error');
  });
});

describe('createScaffoldingContext', () => {
  it('computes context paths for a regular node', () => {
    const { pascalName, dashName } = computeNodeName('my-node');

    const context = createScaffoldingContext({ innerNodeName: 'my-node' });

    expect(context).toEqual({
      nodePascalName: pascalName,
      nodeDashName: dashName,
      newNodeDistPath: `/project/src/nodes/${dashName}`,
      newNodeEditorDistPath: `/project/src/nodes/${dashName}/editor`,
      scaffoldedDistHbs: '/project/dist/scaffolding/create-node/hbs',
      isConfigNode: false,
    });
  });

  it('marks the context as a config node when requested', () => {
    const context = createScaffoldingContext({ innerNodeName: 'my-config', isConfigNode: true });

    expect(context.isConfigNode).toBe(true);
  });
});

describe('distFolderExist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('delegates to fs.existsSync with the context dist path', () => {
    mockExistsSync.mockReturnValue(true);
    const context: ScaffoldingContext = {
      nodePascalName: 'MyNode',
      nodeDashName: 'my-node',
      newNodeDistPath: '/project/src/nodes/my-node',
      newNodeEditorDistPath: '/project/src/nodes/my-node/editor',
      scaffoldedDistHbs: '/project/dist/scaffolding/create-node/hbs',
      isConfigNode: false,
    };

    expect(distFolderExist(context)).toBe(true);
    expect(mockExistsSync).toHaveBeenCalledWith('/project/src/nodes/my-node');
  });
});

function buildContext(isConfigNode: boolean): ScaffoldingContext {
  return {
    nodePascalName: 'MyNode',
    nodeDashName: 'my-node',
    newNodeDistPath: '/project/src/nodes/my-node',
    newNodeEditorDistPath: '/project/src/nodes/my-node/editor',
    scaffoldedDistHbs: '/project/dist/scaffolding/create-node/hbs',
    isConfigNode,
  };
}

describe('prepareStructure', () => {
  it('returns the 6 files to scaffold for a regular node', () => {
    const structure = prepareStructure(buildContext(false));

    expect(structure).toHaveLength(6);
    expect(structure.map((item) => item.finalPath)).toEqual([
      '/project/src/nodes/my-node/controller.ts',
      '/project/src/nodes/my-node/types.ts',
      '/project/src/nodes/my-node/doc.md',
      '/project/src/nodes/my-node/editor/index.ts',
      '/project/src/nodes/my-node/editor/styles.scss',
      '/project/src/nodes/my-node/editor/index.html',
    ]);
    expect(structure[0].templatePath).toBe('/project/dist/scaffolding/create-node/hbs/controller.ts.hbs');
    expect(structure[3].templatePath).toBe('/project/dist/scaffolding/create-node/hbs/editor/index.ts.hbs');
    expect(structure[5].templatePath).toBe('/project/dist/scaffolding/create-node/hbs/editor/index.html.hbs');
  });

  it('uses the -config template suffix for config nodes', () => {
    const structure = prepareStructure(buildContext(true));

    expect(structure[0].templatePath).toBe('/project/dist/scaffolding/create-node/hbs/controller-config.ts.hbs');
    expect(structure[3].templatePath).toBe('/project/dist/scaffolding/create-node/hbs/editor/index-config.ts.hbs');
    expect(structure[5].templatePath).toBe('/project/dist/scaffolding/create-node/hbs/editor/index-config.html.hbs');
  });
});

describe('renderFilesTemplates / writeNewNode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFile.mockImplementation((templatePath: string) => Promise.resolve(`TEMPLATE:${templatePath}`));
  });

  it('renders every file of the structure', async () => {
    const context = buildContext(false);

    const files = await renderFilesTemplates(context);

    expect(files).toHaveLength(6);
    expect(files[0]).toEqual({
      finalPath: '/project/src/nodes/my-node/controller.ts',
      content: 'TEMPLATE:/project/dist/scaffolding/create-node/hbs/controller.ts.hbs',
    });
  });

  it('writes every rendered file to disk', async () => {
    const context = buildContext(false);

    await writeNewNode(context);

    expect(writeFile).toHaveBeenCalledTimes(6);
    expect(writeFile).toHaveBeenCalledWith(
      '/project/src/nodes/my-node/controller.ts',
      'TEMPLATE:/project/dist/scaffolding/create-node/hbs/controller.ts.hbs',
    );
    expect(writeFile).toHaveBeenCalledWith(
      '/project/src/nodes/my-node/editor/index.html',
      'TEMPLATE:/project/dist/scaffolding/create-node/hbs/editor/index.html.hbs',
    );
  });
});

describe('real .hbs templates on disk', () => {
  it('renders every real template file without throwing', async () => {
    const { readFile: actualReadFile } = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
    mockReadFile.mockImplementation((filePath: string) => actualReadFile(filePath, 'utf-8'));

    const hbsDir = path.resolve(process.cwd(), 'src/cli/commands/create-node/hbs');
    const templates = [
      'controller.ts.hbs',
      'controller-config.ts.hbs',
      'types.ts.hbs',
      'doc.md.hbs',
      'editor/index.ts.hbs',
      'editor/index-config.ts.hbs',
      'editor/index.html.hbs',
      'editor/index-config.html.hbs',
      'editor/styles.scss.hbs',
    ];

    for (const template of templates) {
      const rendered = await renderTemplate(path.join(hbsDir, template), {
        nodePascalName: 'MyNode',
        nodeName: 'my-node',
      });
      expect(typeof rendered).toBe('string');
      expect(rendered.length).toBeGreaterThan(0);
    }
  });
});
