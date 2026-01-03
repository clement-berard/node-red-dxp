import { readFileSync } from 'node:fs';
import path from 'node:path';
import { cosmiconfigSync } from 'cosmiconfig';
import { type Entry, globSync } from 'fast-glob';
import { merge } from 'merge-anything';
import { dash, pascal } from 'radash';
import { ConfigSchema, defaultConfig } from './default-config';
import { fixedConfig } from './fixed-config';
import { ZodError } from 'zod';

const CONFIG_FILE_NAME = 'node-red-dxp';

const cleanPkgName = (pkgName: string) => pkgName.replace('@', '').replace('/', '-');

function getConfig() {
  const explorerSync = cosmiconfigSync(CONFIG_FILE_NAME);

  try {
    const result = explorerSync.search();
    const userConfig = result ? result.config : {};

    const mergedConfig = merge(defaultConfig, userConfig);

    return ConfigSchema.parse(mergedConfig);
  } catch (error) {
    if (error instanceof ZodError) {
      const result = explorerSync.search();
      const configFile = result ? result.filepath : 'unknown';

      console.error(`\n❌  Configuration error in ${configFile}:\n`);
      error.issues.forEach((issue) => {
        if (issue.path.length > 0) {
          console.error(`  - Field "${issue.path.join('.')}": ${issue.message}`);
        } else {
          if (issue.code === 'unrecognized_keys' && 'keys' in issue && issue.keys.length > 0) {
            issue.keys.forEach((key) => {
              console.error(`  - Field "${key}": Unrecognized key`);
            });
          } else {
            console.error(`  - ${issue.message}`);
          }
        }
      });
      console.error(
        '\nℹ️  See configuration documentation: https://clement-berard.github.io/node-red-dxp/config-file.html\n',
      );
      process.exit(1);
    }
    throw error;
  }
}
export const currentConfig = getConfig();
const currentDir = process.cwd();
const jsonPackage = JSON.parse(readFileSync(`${currentDir}/package.json`, 'utf-8'));
const pathSrcDir = `${currentDir}/${fixedConfig.srcDir}`;
const pathResourcesDir = `${currentDir}/resources`;
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
    const scssFiles = globSync(`${fullEditorPath}/${fixedConfig.nodes.editor.stylesName}.scss`);
    const mdxFiles = globSync(`${fullPath}/docs.mdx`);
    const mdFiles = globSync(`${fullPath}/docs.md`);
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
        pugPath: `${fullEditorPath}/${fixedConfig.nodes.editor.htmlName}.pug`,
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
    pathResourcesDir,
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
    resolvedSrcPathsScss: globSync(`${pathSrcDir}/${fixedConfig.globalStylesName}.scss`, {
      ignore: [`${pathSrcNodesDir}/**/*.scss`],
    }),
    resolvedNodesPaths: resolvedNodesPaths.map((entry) => entry.path),
    resolvedSrcLocalesPaths: globSync(`${pathSrcDir}/${fixedConfig.localesDirName}/*.json`),
    redServerPath: globSync(`${pathSrcDir}/red-server.ts`),
    listNodesFull: listNodesFull,
    listNodesFullNames,
  };
}

export const currentContext = getCurrentContext();

export type CurrentContext = ReturnType<typeof getCurrentContext>;
export type ListNodesFull = CurrentContext['listNodesFull'];
export type ListNode = ListNodesFull[number];
