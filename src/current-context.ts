import { readFileSync } from 'node:fs';
import path from 'node:path';
import { cosmiconfigSync } from 'cosmiconfig';
import { type Entry, globSync } from 'fast-glob';
import { merge } from 'merge-anything';
import { dash, pascal } from 'radash';
import { type Config, defaultConfig, fixedConfig } from './default-config';

const CONFIG_FILE_NAME = 'node-red-dx';

const cleanPkgName = (pkgName: string) => pkgName.replace('@', '').replace('/', '-');

function getConfig() {
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
const pathSrcDir = `${currentDir}/${fixedConfig.srcDir}`;
const additionalResourcesDir = `${currentDir}/resources`;
const pathSrcNodesDir = `${pathSrcDir}/${fixedConfig.nodesDirName}`;
const pathLibCacheDir = `${currentDir}/${fixedConfig.libCacheDir}`;
const currentPackagedDistPath = `${path.resolve(__dirname, '..')}`;
const packageNameSlug = cleanPkgName(jsonPackage.name);

function listNodeFolders(rawNodes: Entry[] = []) {
  return rawNodes.map((entry) => {
    const fullPath = entry.path;
    const fullEditorPath = `${fullPath}/${fixedConfig.nodes.editor.dirName}`;
    const relativePath = fullPath.replace(currentDir, '').slice(1);
    const relativeEditorPath = `${relativePath}/${fixedConfig.nodes.editor.dirName}`;
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
      nodeIdentifier: `${packageNameSlug}-${dashName}`,
      fullControllerPath: `${fullPath}/${fixedConfig.nodes.controllerName}.ts`,
      editor: {
        tsPath: `${fullEditorPath}/${fixedConfig.nodes.editor.tsName}.ts`,
        htmlPath: `${fullEditorPath}/${fixedConfig.nodes.editor.htmlName}.html`,
        scssFiles,
      },
      doc: {
        mdxFiles,
        mdFiles,
      },
    };
  });
}

function getCurrentContext() {
  const resolvedNodesPaths = globSync(`${pathSrcNodesDir}/**/*`, { onlyDirectories: true, deep: 1, objectMode: true });
  const listNodesFull = listNodeFolders(resolvedNodesPaths);
  const listNodesFullNames = listNodesFull.map((node) => node.name);

  return {
    currentDir,
    pathSrcDir,
    pathSrcNodesDir,
    additionalResourcesDir,
    pathDist: `${currentDir}/${currentConfig.builder.outputDir}`,
    currentPackagedDistPath,
    cacheDirFiles: {
      controllerIndex: `${pathLibCacheDir}/controller-index.ts`,
      editorIndex: `${pathLibCacheDir}/editor-index.ts`,
    },
    pathLibCacheDir,
    packageName: jsonPackage.name,
    packageNameSlug,
    config: currentConfig,
    resolvedSrcPathsScss: globSync(`${pathSrcDir}/**/*.scss`, { ignore: [`${pathSrcNodesDir}/**/*.scss`] }),
    resolvedNodesPaths: resolvedNodesPaths.map((entry) => entry.path),
    resolvedSrcLocalesPaths: globSync(`${pathSrcDir}/${fixedConfig.localesDirName}/*.json`),
    listNodesFull: listNodesFull,
    listNodesFullNames,
  };
}

export const currentContext = getCurrentContext();

export type CurrentContext = ReturnType<typeof getCurrentContext>;
export type ListNodesFull = typeof currentContext.listNodesFull;
export type ListNode = ListNodesFull[number];
