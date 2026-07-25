import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';
import { currentContext } from '../../../current-context';
import { fixedConfig } from '../../../fixed-config';
import { computeNodeName } from '../../../tools/common-utils';
import { writeFile } from '../../../tools/node-utils';

async function loadTemplate(filePath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(filePath);
    return await fsPromises.readFile(absolutePath, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load file: ${error.message}`);
    }
    throw error;
  }
}

export async function renderTemplate(templateFilePath: string, data: object): Promise<string> {
  try {
    const templateSource = await loadTemplate(templateFilePath);
    const template = Handlebars.compile(templateSource);
    return template(data);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to render template: ${error.message}`);
    }
    throw error;
  }
}

type CreateNodeScaffoldingOptions = {
  innerNodeName: string;
  isConfigNode?: boolean;
};

export type ScaffoldingContext = {
  nodePascalName: string;
  nodeDashName: string;
  newNodeDistPath: string;
  newNodeEditorDistPath: string;
  scaffoldedDistHbs: string;
  isConfigNode: boolean;
};

export function createScaffoldingContext(options: CreateNodeScaffoldingOptions): ScaffoldingContext {
  const { pascalName, dashName } = computeNodeName(options.innerNodeName);
  const newNodeDistPath = `${currentContext.pathSrcNodesDir}/${dashName}`;

  return {
    nodePascalName: pascalName,
    nodeDashName: dashName,
    newNodeDistPath,
    newNodeEditorDistPath: `${newNodeDistPath}/${fixedConfig.nodes.editor.dirName}`,
    scaffoldedDistHbs: `${currentContext.currentPackagedDistPath}/scaffolding/create-node/hbs`,
    isConfigNode: !!options.isConfigNode,
  };
}

export function distFolderExist(context: ScaffoldingContext): boolean {
  return fs.existsSync(context.newNodeDistPath);
}

export function prepareStructure(context: ScaffoldingContext) {
  return [
    {
      finalPath: `${context.newNodeDistPath}/controller.ts`,
      templatePath: `${context.scaffoldedDistHbs}/controller${context.isConfigNode ? '-config' : ''}.ts.hbs`,
      templateData: {
        nodePascalName: context.nodePascalName,
        nodeName: context.nodeDashName,
      },
    },
    {
      finalPath: `${context.newNodeDistPath}/types.ts`,
      templatePath: `${context.scaffoldedDistHbs}/types.ts.hbs`,
      templateData: {
        nodePascalName: context.nodePascalName,
        nodeName: context.nodeDashName,
      },
    },
    {
      finalPath: `${context.newNodeDistPath}/doc.md`,
      templatePath: `${context.scaffoldedDistHbs}/doc.md.hbs`,
      templateData: {},
    },
    {
      finalPath: `${context.newNodeEditorDistPath}/${fixedConfig.nodes.editor.tsName}.ts`,
      templatePath: `${context.scaffoldedDistHbs}/editor/index${context.isConfigNode ? '-config' : ''}.ts.hbs`,
      templateData: {
        nodePascalName: context.nodePascalName,
        nodeName: context.nodeDashName,
      },
    },
    {
      finalPath: `${context.newNodeEditorDistPath}/styles.scss`,
      templatePath: `${context.scaffoldedDistHbs}/editor/styles.scss.hbs`,
      templateData: {
        nodeName: context.nodeDashName,
      },
    },
    {
      finalPath: `${context.newNodeEditorDistPath}/${fixedConfig.nodes.editor.htmlName}.html`,
      templatePath: `${context.scaffoldedDistHbs}/editor/index${context.isConfigNode ? '-config' : ''}.html.hbs`,
      templateData: {},
    },
  ];
}

export async function renderFilesTemplates(context: ScaffoldingContext) {
  const prepared = prepareStructure(context).map(async (item) => {
    const content = await renderTemplate(item.templatePath, item.templateData);
    return {
      finalPath: item.finalPath,
      content,
    };
  });

  return await Promise.all(prepared);
}

export async function writeNewNode(context: ScaffoldingContext): Promise<void> {
  const files = await renderFilesTemplates(context);

  await Promise.all(files.map((file) => writeFile(file.finalPath, file.content)));
}
