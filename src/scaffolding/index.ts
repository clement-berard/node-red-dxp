import fs from 'node:fs/promises';
import path from 'node:path';
import Handlebars from 'handlebars';

async function loadTemplate(filePath: string): Promise<string> {
  try {
    const absolutePath = path.resolve(filePath);
    return await fs.readFile(absolutePath, 'utf-8');
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
