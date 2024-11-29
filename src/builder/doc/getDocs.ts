import fsPromise from 'node:fs/promises';
import { mdxToMd } from 'mdx-to-md';
import { currentContext } from '../../current-context';

function wrapInScript(content: string, nodeName: string) {
  return `
<script type="text/markdown" data-help-name="${nodeName}">
${content}
</script>`.trim();
}

async function processMdx(path: string, nodeName: string) {
  process.env.NODE_ENV = 'production';
  const content = await mdxToMd(path);
  return wrapInScript(content, nodeName);
}

async function processMd(path: string, nodeName: string) {
  const content = await fsPromise.readFile(path, 'utf8');
  return wrapInScript(content, nodeName);
}

async function processAllDocs(node: any) {
  return node.isMdx ? await processMdx(node.path, node.name) : await processMd(node.path, node.name);
}

export async function handleDocs() {
  const allDocsFiles = currentContext.listNodesFull.flatMap((node) => {
    const hasMdxFile = node.doc.mdxFiles.length !== 0;
    const hasMdFile = node.doc.mdFiles.length !== 0;

    if (!hasMdxFile && !hasMdFile) {
      return [];
    }

    const isMd = !hasMdxFile && hasMdFile;

    return {
      path: isMd ? node.doc.mdFiles[0] : node.doc.mdxFiles[0],
      name: node.name,
      isMdx: hasMdxFile,
      isMd: isMd,
    };
  });

  const all = await Promise.all(allDocsFiles.map((node) => processAllDocs(node)));

  return all.length ? all.join('\n') : '';
}
