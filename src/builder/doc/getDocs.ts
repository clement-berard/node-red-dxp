import fsPromise from 'node:fs/promises';
import { mdxToMd } from 'mdx-to-md';
import { currentContext } from '../../current-context';

process.env.NODE_ENV = 'production';

type DocNode = {
  path: string;
  name: string;
  isMdx: boolean;
};

function wrapInScript(content: string, nodeName: string) {
  return `
<script type="text/markdown" data-help-name="${nodeName}">
${content}
</script>`.trim();
}

async function processMdx(path: string, nodeName: string) {
  const content = await mdxToMd(path);
  return wrapInScript(content, nodeName);
}

async function processMd(path: string, nodeName: string) {
  const content = await fsPromise.readFile(path, 'utf8');
  return wrapInScript(content, nodeName);
}

export async function handleDocs() {
  const allDocsFiles = currentContext.listNodesFull.flatMap((node): DocNode[] => {
    const hasMdxFile = node.doc.mdxFiles.length !== 0;
    const hasMdFile = node.doc.mdFiles.length !== 0;

    if (!hasMdxFile && !hasMdFile) return [];

    return [
      {
        path: hasMdxFile ? node.doc.mdxFiles[0] : node.doc.mdFiles[0],
        name: node.name,
        isMdx: hasMdxFile,
      },
    ];
  });

  const all = await Promise.all(
    allDocsFiles.map((node) => (node.isMdx ? processMdx(node.path, node.name) : processMd(node.path, node.name))),
  );

  return all.length ? all.join('\n') : '';
}
