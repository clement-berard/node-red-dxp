// import fs from 'node:fs';
// import path from 'node:path';
// import { globSync } from 'glob';
// import { currentInstance } from '../current-instance';
//
// export function listNodeFolders(dir: string) {
//   const rawNodes = globSync(`${currentInstance.pathSrcNodesDir}/*`, { withFileTypes: true });
//
//   return rawNodes.map((entry) => {
//     return {
//       name: entry.name,
//       fullPath: entry.fullpath(),
//     };
//   });
// }
//
// export function listFilesInNodeFolder(dir: string) {
//   const entries = fs.readdirSync(dir, { withFileTypes: true });
//   const onlyDirs = entries.filter((entry) => entry.isDirectory());
//   const onlyFiles = entries.filter((entry) => entry.isFile());
//   const editorDir = onlyDirs.find((entry) => entry.name === 'editor');
//   const editorFiles = fs.readdirSync(path.join(dir, editorDir.name), { withFileTypes: true });
//
//   const allFiles = onlyFiles.map((entry) => {
//     return entry.name;
//   });
//
//   const allEditorFiles = editorFiles
//     .map((entry) => {
//       return entry.name;
//     })
//     .map((name) => `editor/${name}`);
//
//   const all = [...allFiles, ...allEditorFiles];
//
//   return {
//     allFiles: all,
//   };
// }
//
// const expectedFiles = ['index.ts', 'editor/index.html', 'editor/styles.scss', 'editor/index.ts'];
//
// export function renderNodeValidation(nodesDir) {
//   console.log('sss', listNodeFolders(nodesDir));
//   listNodeFolders(nodesDir).map((node) => {
//     const tot = listFilesInNodeFolder(node.fullPath);
//     const yy = expectedFiles.every((file) => tot.allFiles.includes(file));
//     if (yy) {
//       console.log('VALID', node.name);
//     } else {
//       console.log('INVALID', node.name);
//       console.log('Excepted files:', expectedFiles);
//       console.log('Actual files:', tot.allFiles);
//     }
//   });
// }
