import fsPromise from 'node:fs/promises';
import { group, isEmpty, merge } from 'radash';
import { type ListNode, currentContext } from '../../current-context';
import { createFolderIfNotExists, writeFile } from '../../utils/node-utils';

function resolveLangCode(path: string) {
  return path.split('/').pop()?.split('.').shift();
}

async function readJsonFile(path: string) {
  return fsPromise.readFile(path, 'utf8');
}

export class LocalesBuilder {
  private async parseJsonFile(path: string) {
    const fileContent = await readJsonFile(path);
    return { fileContent, fileContentParsed: JSON.parse(fileContent) };
  }

  async resolveGlobalLocalesPath(path: string) {
    const { fileContent, fileContentParsed } = await this.parseJsonFile(path);
    return {
      folderName: resolveLangCode(path),
      fileContent,
      fileContentParsed,
      filePath: path,
      isGlobal: true,
      nodeName: null,
    };
  }

  async loadNodesLocales(listNodesFull: ListNode[]) {
    const allTasks = listNodesFull.flatMap((node) =>
      node.resolvedLocalesPaths.map(async (path) => {
        const { fileContent, fileContentParsed } = await this.parseJsonFile(path);
        return {
          folderName: resolveLangCode(path),
          filePath: path,
          fileContent,
          fileContentParsed,
          nodeName: node.name,
          isGlobal: false,
        };
      }),
    );

    return Promise.all(allTasks);
  }

  async getAll() {
    const [srcLocales, nodesLocales] = await Promise.all([
      Promise.all(currentContext.resolvedSrcLocalesPaths.map((path) => this.resolveGlobalLocalesPath(path))),
      this.loadNodesLocales(currentContext.listNodesFull),
    ]);

    const totalLocales = [...srcLocales, ...nodesLocales];

    const uniqueCodes = Array.from(new Set(totalLocales.map((locale) => locale.folderName)));

    for (const code of uniqueCodes) {
      for (const nodeName of currentContext.listNodesFullNames) {
        if (!nodesLocales.some((locale) => locale.folderName === code && locale.nodeName === nodeName)) {
          totalLocales.push({
            folderName: code,
            filePath: null,
            fileContent: '',
            fileContentParsed: null,
            isGlobal: false,
            nodeName,
          });
        }
      }
    }

    const fishBySource = group(totalLocales, (f) => f.folderName);

    const updatedLocales = [];

    for (const [folderName, items] of Object.entries(fishBySource)) {
      const globalItem = items.find((item) => item.isGlobal);
      const globalContent = globalItem?.fileContentParsed ?? {};

      for (const item of items) {
        if (item.isGlobal) continue;

        if (isEmpty(globalContent) && isEmpty(item.fileContentParsed)) {
          continue;
        }

        const combinedContent = {
          ...globalContent,
          ...item.fileContentParsed,
        };

        const wrappedContent = {
          [item.nodeName]: combinedContent || {},
        };

        updatedLocales.push({
          folderName,
          fileNodeContent: wrappedContent,
        });
      }
    }

    const fishBySource2 = group(updatedLocales, (f) => f.folderName);

    const result = [];

    for (const [folderName, items] of Object.entries(fishBySource2)) {
      const allContent = items.map((item) => {
        return JSON.stringify(item.fileNodeContent).trim().slice(1, -1);
      });

      const allContentString = `{${allContent.join(',')}}`;

      const res = {
        folderPath: `${currentContext.pathDist}/locales/${folderName}`,
        finalPath: `${currentContext.pathDist}/locales/${folderName}/index.json`,
        allContent: allContentString,
      };

      result.push(res);
    }

    return result;
  }

  async exportAll() {
    const locales = await this.getAll();

    await Promise.all(locales.map((locale) => createFolderIfNotExists(locale.folderPath)));
    return Promise.all(locales.map((locale) => writeFile(locale.finalPath, locale.allContent)));
  }
}
