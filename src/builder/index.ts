import { getCurrentInstance } from '../current-instance';
import { cleanPaths, createFolderIfNotExists, writeFile } from '../utils/node-utils';
import { buildNodeController } from './esbuild';
import { buildFinalDistIndexContent } from './final-index';
import { getControllerIndexContent, getEditorIndexContent } from './templates';

export const currentInstance = getCurrentInstance();

export * from './templates';
export * from './styles';
export * from './html';
export * from './final-index';
export * from './doc';

type BuildAllPackageParams = {
  minify?: boolean;
};

export async function buildAllPackage(params?: BuildAllPackageParams): Promise<void> {
  const { minify = false } = params || {};

  const nodeFoldersDefinition = currentInstance.getListNodesFull();

  createFolderIfNotExists(currentInstance.pathLibCacheDir);
  await cleanPaths([currentInstance.pathDist]);

  const controllerTask = getControllerIndexContent(nodeFoldersDefinition).then((content) => {
    writeFile(`${currentInstance.cacheDirFiles.controllerIndex}`, content).then(() => {
      buildNodeController(minify);
    });
  });

  const editorTask = getEditorIndexContent(nodeFoldersDefinition).then((content) => {
    writeFile(`${currentInstance.cacheDirFiles.editorIndex}`, content).then(() => {
      buildFinalDistIndexContent({
        minify,
        nodes: nodeFoldersDefinition,
      }).then(async (contentFinalIndexHtml) => {
        await writeFile(`${currentInstance.pathDist}/index.html`, contentFinalIndexHtml);
      });
    });
  });

  await Promise.all([
    controllerTask,
    editorTask,
    writeFile(`${currentInstance.pathLibCacheDir}/config.json`, JSON.stringify(currentInstance.config, null, 2)),
  ]);
}
