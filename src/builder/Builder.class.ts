import { currentContext } from '../current-context';
import { cleanPaths, createFolderIfNotExists, writeFile } from '../utils/node-utils';
import { BuilderController } from './controller/BuilderController.class';
import { BuilderEditor } from './editor/BuilderEditor.class';

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

  prepare() {
    // Create cache dir
    createFolderIfNotExists(currentContext.pathLibCacheDir);
    // Clean dist folder and write config file
    const runs = [
      cleanPaths([currentContext.pathDist]),
      writeFile(`${currentContext.pathLibCacheDir}/config.json`, JSON.stringify(currentContext.config, null, 2)),
    ];

    return Promise.all(runs);
  }

  async buildAll() {
    await this.prepare();
    return Promise.all([this.builderController.getControllerTask(), this.builderEditor.getEditorTask()]);
  }
}
