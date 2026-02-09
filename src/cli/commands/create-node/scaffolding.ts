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
    throw new Error(`Failed to load file: ${error.message}`);
  }
}

export async function renderTemplate(templateFilePath: string, data: object): Promise<string> {
  try {
    const templateSource = await loadTemplate(templateFilePath);
    const template = Handlebars.compile(templateSource);
    return template(data);
  } catch (error) {
    throw new Error(`Failed to render template: ${error.message}`);
  }
}

type CreateNodeScaffoldingOptions = {
  innerNodeName: string;
  isConfigNode?: boolean;
};

export class CreateNodeScaffolding {
  readonly nodePascalName: string;
  readonly nodeDashName: string;
  readonly newNodeDistPath: string;
  readonly newNodeEditorDistPath: string;
  readonly scaffoldedDistHbs: string;
  private isConfigNode: boolean;

  constructor(options: CreateNodeScaffoldingOptions) {
    const { pascalName, dashName } = computeNodeName(options.innerNodeName);
    this.nodePascalName = pascalName;
    this.nodeDashName = dashName;
    this.newNodeDistPath = `${currentContext.pathSrcNodesDir}/${dashName}`;
    this.newNodeEditorDistPath = `${this.newNodeDistPath}/${fixedConfig.nodes.editor.dirName}`;
    this.scaffoldedDistHbs = `${currentContext.currentPackagedDistPath}/scaffolding/create-node/hbs`;
    this.isConfigNode = options.isConfigNode;
  }

  distFolderExist() {
    return fs.existsSync(this.newNodeDistPath);
  }

  prepareStructure() {
    return [
      {
        finalPath: `${this.newNodeDistPath}/controller.ts`,
        templatePath: `${this.scaffoldedDistHbs}/controller${this.isConfigNode ? '-config' : ''}.ts.hbs`,
        templateData: {
          nodePascalName: this.nodePascalName,
          nodeName: this.nodeDashName,
        },
      },
      {
        finalPath: `${this.newNodeDistPath}/types.ts`,
        templatePath: `${this.scaffoldedDistHbs}/types.ts.hbs`,
        templateData: {
          nodePascalName: this.nodePascalName,
          nodeName: this.nodeDashName,
        },
      },
      {
        finalPath: `${this.newNodeDistPath}/doc.md`,
        templatePath: `${this.scaffoldedDistHbs}/doc.md.hbs`,
        templateData: {},
      },
      {
        finalPath: `${this.newNodeEditorDistPath}/${fixedConfig.nodes.editor.tsName}.ts`,
        templatePath: `${this.scaffoldedDistHbs}/editor/index${this.isConfigNode ? '-config' : ''}.ts.hbs`,
        templateData: {
          nodePascalName: this.nodePascalName,
          nodeName: this.nodeDashName,
        },
      },
      {
        finalPath: `${this.newNodeEditorDistPath}/styles.scss`,
        templatePath: `${this.scaffoldedDistHbs}/editor/styles.scss.hbs`,
        templateData: {
          nodeName: this.nodeDashName,
        },
      },
      {
        finalPath: `${this.newNodeEditorDistPath}/${fixedConfig.nodes.editor.htmlName}.html`,
        templatePath: `${this.scaffoldedDistHbs}/editor/index${this.isConfigNode ? '-config' : ''}.html.hbs`,
        templateData: {},
      },
    ];
  }

  async renderFilesTemplates() {
    const prepared = this.prepareStructure().map(async (item) => {
      return renderTemplate(item.templatePath, item.templateData).then((content) => {
        return {
          finalPath: item.finalPath,
          content,
        };
      });
    });

    return await Promise.all(prepared);
  }

  async writeNewNode() {
    const files = await this.renderFilesTemplates();

    await Promise.all(files.map((file) => writeFile(file.finalPath, file.content)));
  }
}
