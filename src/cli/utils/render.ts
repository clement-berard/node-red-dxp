import { readFile } from 'node:fs/promises';

export type TemplateData = Record<string, string | number | boolean>;

/** Replaces each `{{key}}` by its value; an unknown key is an error (a typo must not reach a generated file). */
export function renderTemplate(source: string, data: TemplateData): string {
  return source.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_match, key: string) => {
    if (!(key in data)) {
      throw new Error(`Template variable "${key}" is not provided`);
    }
    return String(data[key]);
  });
}

export async function renderTemplateFile(filePath: string, data: TemplateData): Promise<string> {
  return renderTemplate(await readFile(filePath, 'utf-8'), data);
}
