import fsPromise from 'node:fs/promises';
import { currentContext } from '../../current-context';

async function processDoc(path: string, nodeName: string) {
  const content = await fsPromise.readFile(path, 'utf8');
  return `
<script type="text/markdown" data-help-name="${nodeName}">
${content}
</script>`.trim();
}

export async function getMdDocs() {
  const allMdFiles = currentContext.listNodesFull.flatMap((node) => {
    if (node.doc.mdFiles.length === 0) {
      return [];
    }

    return {
      path: node.doc.mdFiles[0],
      name: node.name,
    };
  });

  const allPromises = await Promise.all(allMdFiles.map((node) => processDoc(node.path, node.name)));

  return allPromises.length ? allPromises.join('\n') : '';
}
