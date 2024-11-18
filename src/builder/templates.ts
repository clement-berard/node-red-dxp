import * as fs from 'node:fs';
import * as path from 'node:path';
import { currentInstance } from '../current-instance';

const nodeFoldersDefinition = currentInstance.getListNodesFull();

const contentHeader = `
// generated by @keload/node-red-dev-xp
// do not modify this file
// do not commit this file
`;

export function getControllerIndex() {
  return `
${contentHeader}
import type { NodeAPI } from 'node-red';
${nodeFoldersDefinition.map((node) => `import ${node.pascalName} from '${node.fullControllerPath}';`).join('\n')}


export default async (RED: NodeAPI): Promise<void> => {
    global.RED = RED;

    ${nodeFoldersDefinition.map((node) => `// @ts-ignore\nglobal.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
};
`.trim();
}

export function getEditorIndex() {
  return `
${contentHeader}
import type { NodeAPI } from 'node-red';
${nodeFoldersDefinition.map((node) => `import ${node.pascalName} from '${node.editor.tsPath}';`).join('\n')}

declare const RED: NodeAPI;

${nodeFoldersDefinition.map((node) => `// @ts-ignore\nwindow.RED.nodes.registerType('${node.name}', ${node.pascalName});`).join('\n')}
`.trim();
}

export function writeControllerIndex() {
  fs.writeFileSync(`${currentInstance.cacheDirFiles.controllerIndex}`, getControllerIndex());
}

export function writeEditorIndex() {
  fs.writeFileSync(`${currentInstance.cacheDirFiles.editorIndex}`, getEditorIndex());
}
