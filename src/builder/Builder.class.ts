import fsPromise from 'node:fs/promises';
import { currentContext } from '../current-context';
import { cleanPaths, createFolderIfNotExists, writeFile } from '../tools/node-utils';
import { BuilderController } from './controller/BuilderController.class';
import { BuilderEditor } from './editor/BuilderEditor.class';
import { writeAllLocales } from './locales/getLocales';

type BuilderClassParams = {
  minify?: boolean;
};

export class Builder {
  private readonly builderController: BuilderController;
  private readonly builderEditor: BuilderEditor;

  constructor({ minify = false }: BuilderClassParams = {}) {
    this.builderController = new BuilderController({ minify });
    this.builderEditor = new BuilderEditor({ minify });
  }

  async prepare() {
    const { pathLibCacheDir, pathDist, currentPackagedDistPath, config } = currentContext;

    createFolderIfNotExists(pathLibCacheDir);

    await cleanPaths([pathDist]);

    await Promise.all([
      writeFile(`${pathLibCacheDir}/config.json`, JSON.stringify(config, null, 2)),
      fsPromise.copyFile(
        `${currentPackagedDistPath}/editor/assets/pug-helper.pug`,
        `${pathLibCacheDir}/pug-helper.pug`,
      ),
      fsPromise.cp(`${currentPackagedDistPath}/editor/assets/pug`, `${pathLibCacheDir}/pug`, { recursive: true }),
    ]);

    createFolderIfNotExists(pathDist);
  }

  async buildAll() {
    await this.prepare();
    return Promise.all([
      this.builderController.getControllerTask(),
      this.builderEditor.getEditorTask(),
      writeAllLocales(),
    ]);
  }
}
