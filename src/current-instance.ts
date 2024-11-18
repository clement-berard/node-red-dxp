import { readFileSync } from 'node:fs';
import { cosmiconfigSync } from 'cosmiconfig';
import { globSync } from 'glob';
import { merge } from 'merge-anything';
import { dash, pascal } from 'radash';
import { type Config, defaultConfig } from './default-config';

const CONFIG_FILE_NAME = 'node-red-dx';

export const cleanPkgName = (pkgName: string) => pkgName.replace('@', '').replace('/', '-');

export function getConfig() {
  const explorerSync = cosmiconfigSync(CONFIG_FILE_NAME);

  try {
    const result = explorerSync.search();

    return merge(defaultConfig, result ? result.config : {}) as Config;
  } catch (error) {
    console.error('Error while loading configuration', error);
    throw error;
  }
}

const currentConfig = getConfig();

const currentDir = process.cwd();
const jsonPackage = JSON.parse(readFileSync(`${currentDir}/package.json`, 'utf-8'));
const pathSrcDir = `${currentDir}/${currentConfig.srcDir}`;
const additionalResourcesDir = `${currentDir}/resources`;
const pathSrcNodesDir = `${pathSrcDir}/${currentConfig.nodesDirName}`;
const pathLibCacheDir = `${currentDir}/${currentConfig.libCacheDir}`;

export function listNodeFolders() {
  const rawNodes = globSync(`${pathSrcNodesDir}/*`, { withFileTypes: true });

  return rawNodes.map((entry) => {
    const fullPath = entry.fullpath();
    const fullEditorPath = `${fullPath}/${currentConfig.nodes.editor.dirName}`;
    const relativePath = fullPath.replace(currentDir, '').slice(1);
    const relativeEditorPath = `${relativePath}/${currentConfig.nodes.editor.dirName}`;
    const scssFiles = globSync(`${fullEditorPath}/**/*.scss`);
    const mdxFiles = globSync(`${fullPath}/doc.mdx`);
    const mdFiles = globSync(`${fullPath}/doc.md`);
    const dashName = dash(entry.name);
    return {
      fullEditorPath,
      fullPath,
      name: entry.name,
      pascalName: pascal(entry.name),
      dashName,
      relativeEditorPath,
      relativePath,
      nodeIdentifier: `${currentInstance.packageNameSlug}-${dashName}`,
      fullControllerPath: `${fullPath}/${currentConfig.nodes.controllerName}.ts`,
      editor: {
        tsPath: `${fullEditorPath}/${currentConfig.nodes.editor.tsName}.ts`,
        htmlPath: `${fullEditorPath}/${currentConfig.nodes.editor.htmlName}.html`,
        scssFiles,
      },
      doc: {
        mdxFiles,
        mdFiles,
      },
    };
  });
}

export function getCurrentInstance() {
  return {
    currentDir,
    pathSrcDir,
    pathSrcNodesDir,
    additionalResourcesDir,
    pathDist: `${currentDir}/${currentConfig.builder.outputDir}`,
    cacheDirFiles: {
      controllerIndex: `${pathLibCacheDir}/controller-index.ts`,
      editorIndex: `${pathLibCacheDir}/editor-index.ts`,
    },
    pathLibCacheDir,
    packageName: jsonPackage.name,
    packageNameSlug: cleanPkgName(jsonPackage.name),
    config: currentConfig,
    getResolvedSrcPathsScss: () => {
      return globSync(`${pathSrcDir}/**/*.scss`, { ignore: `${pathSrcNodesDir}/**/*.scss` });
    },
    getResolvedNodesPaths: () => {
      return globSync(`${pathSrcNodesDir}/*`);
    },
    getListNodesFull: () => {
      return listNodeFolders();
    },
  };
}

export const currentInstance = getCurrentInstance();
