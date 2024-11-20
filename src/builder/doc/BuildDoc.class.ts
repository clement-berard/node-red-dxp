import fs from 'node:fs';
import { currentContext } from '../../current-context';

export class BuildDoc {
  // TODO need to refactor
  getAllDocContent() {
    const result = [];

    for (const node of currentContext.listNodesFull) {
      const fileMd = node.doc.mdFiles[0];
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
}
