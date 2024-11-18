import fs from 'node:fs';
import { currentInstance } from '../current-instance';

export function handleAllDoc() {
  const nodes = currentInstance.getListNodesFull();

  const result = [];

  for (const node of nodes) {
    const fileMd = node.doc.mdFiles[0];
    // const fileMdx = node.doc.mdxFiles[0];
    if (fileMd) {
      const htmlMd = fs.readFileSync(node.doc.mdFiles[0], 'utf-8');
      const inner = `
<script type="text/markdown" data-help-name="${node.name}">
${htmlMd}
</script>
      `;
      result.push(inner);
    }
  }

  return result.length ? result.join('\n') : '';
}
