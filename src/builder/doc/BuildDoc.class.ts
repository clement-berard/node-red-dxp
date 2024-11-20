import fs from 'node:fs';
import type { Context } from '../../Context';

type BuildDocParams = {
  context: Context;
};

export class BuildDoc {
  private context: Context;

  constructor(params: BuildDocParams) {
    this.context = params.context;
  }

  // TODO need to refactor
  getAllDocContent() {
    const result = [];

    for (const node of this.context.listNodesFull) {
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
