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
  private params: BuilderClassParams;
  private builderController: BuilderController;
  private builderEditor: BuilderEditor;

  constructor(params?: BuilderClassParams) {
    this.params = { minify: false, ...params };
    this.builderController = new BuilderController({
      minify: this.params.minify,
    });
    this.builderEditor = new BuilderEditor({
      minify: this.params.minify,
    });
  }

  async prepare() {
    // Create cache dir
    createFolderIfNotExists(currentContext.pathLibCacheDir);
    // Clean dist folder and write config file
    const pugHelperSourceFile = `${currentContext.currentPackagedDistPath}/editor/assets/pug-helper.pug`;
    const pugHelperSourceFolder = `${currentContext.currentPackagedDistPath}/editor/assets/pug`;
    const runs = [
      cleanPaths([currentContext.pathDist]),
      writeFile(`${currentContext.pathLibCacheDir}/config.json`, JSON.stringify(currentContext.config, null, 2)),
      fsPromise.copyFile(pugHelperSourceFile, `${currentContext.pathLibCacheDir}/pug-helper.pug`),
      fsPromise.cp(pugHelperSourceFolder, `${currentContext.pathLibCacheDir}/pug`, { recursive: true }),
    ];

    return Promise.all(runs).then(() => {
      createFolderIfNotExists(currentContext.pathDist);
    });
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
