import * as fsPromise from 'node:fs/promises';
import { getCurrentInstance } from '../current-instance';
import { buildNodeController } from './esbuild';
import { buildFinalDistIndexContent } from './final-index';
import { getControllerIndexContent, getEditorIndexContent } from './templates';
import { cleanPaths, ensureDirectoryExists, writeFile } from './utils';

export const currentInstance = getCurrentInstance();

export * from './templates';
export * from './styles';
export * from './html';
export * from './final-index';
export * from './doc';

export async function writeCacheConfigFile(): Promise<void> {
  try {
    await fsPromise.writeFile(
      `${currentInstance.pathLibCacheDir}/config.json`,
      JSON.stringify(currentInstance.config, null, 2),
      'utf-8',
    );
  } catch (error) {
    console.error('Error writing cache config file:', error);
  }
}

type BuildAllPackageParams = {
  minify?: boolean;
};

export async function buildAllPackage(params?: BuildAllPackageParams): Promise<void> {
  const { minify = false } = params || {};

  const nodeFoldersDefinition = currentInstance.getListNodesFull();

  ensureDirectoryExists(currentInstance.pathLibCacheDir);
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
        // const extractor = new CSSExtractor({
        //   ...options,
        //   sources: [`${currentInstance.pathDist}`],
        //   include: ['**/*.{html}'],
        // });
        //
        // extractor.init();
        // await extractor.prepare();
        // const resolvedVirtualModuleId = extractor.;
        // console.log('extractor', resolvedVirtualModuleId);
        // await extractCSSFromHTML(contentFinalIndexHtml, `${currentInstance.pathDist}/index.css}`, {
        //   verbose: 1,
        // });

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
