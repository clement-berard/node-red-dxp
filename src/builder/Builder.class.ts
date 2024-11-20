import { Context } from '../Context';
import { cleanPaths, createFolderIfNotExists, writeFile } from '../utils/node-utils';
import { BuilderController } from './controller/BuilderController.class';
import { BuilderEditor } from './editor/BuilderEditor.class';

type BuilderClassParams = {
  minify?: boolean;
  context?: Context;
};

export class Builder {
  private params: BuilderClassParams;
  private builderController: BuilderController;
  private builderEditor: BuilderEditor;
  readonly context: Context;

  constructor(params?: BuilderClassParams) {
    this.params = { minify: false, ...params };
    this.context = this.params.context || new Context();
    this.builderController = new BuilderController({
      minify: this.params.minify,
      context: this.context,
    });
    this.builderEditor = new BuilderEditor({
      minify: this.params.minify,
      context: this.context,
    });
  }

  prepare() {
    // Create cache dir
    createFolderIfNotExists(this.context.current.pathLibCacheDir);
    // Clean dist folder and write config file
    const runs = [
      cleanPaths([this.context.current.pathDist]),
      writeFile(
        `${this.context.current.pathLibCacheDir}/config.json`,
        JSON.stringify(this.context.current.config, null, 2),
      ),
    ];

    return Promise.all(runs);
  }

  async buildAll() {
    await this.prepare();
    return Promise.all([this.builderController.getControllerTask(), this.builderEditor.getEditorTask()]);
  }
}
