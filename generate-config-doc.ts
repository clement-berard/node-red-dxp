import { writeFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { zod2md } from 'zod2md';
import { defaultConfig } from './src/default-config';

(async () => {
  const markdown = await zod2md({
    entry: 'src/default-config.ts',
    title: 'Models reference',
  });
  const content = markdown.replace(/^.*\n/, '');
  const yamlConfig = yaml.dump(defaultConfig);

  const final = `
## Default configuration / Example

:::tabs
== .node-red-dxprc.yaml 
\`\`\`yaml
${yamlConfig}
\`\`\`
== .node-red-dxprc.json
\`\`\`json
${JSON.stringify(defaultConfig, null, 2)}
\`\`\`
:::

${content}
  `;

  writeFileSync('docs/generated-config.md', final.trim(), 'utf-8');
})();
