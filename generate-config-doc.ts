import { writeFileSync } from 'node:fs';
// @ts-ignore TS6 - No types exports in this package
import yaml from 'js-yaml';
import { zod2md } from 'zod2md';
import { defaultConfig } from './src/default-config';

(async () => {
  const markdown = await zod2md({
    entry: 'src/default-config.ts',
    title: 'Models reference',
  });

  let content = markdown.replace(/^.*\n/, '');

  content = content.replace(/<([a-zA-Z0-9_]+)([\s,>[\]])/g, (match, p1, p2) => {
    const htmlTags = [
      'br',
      'p',
      'div',
      'span',
      'ul',
      'li',
      'a',
      'b',
      'i',
      'strong',
      'em',
      'details',
      'summary',
      'code',
      'table',
      'tr',
      'td',
      'th',
      'tbody',
      'thead',
    ];
    if (htmlTags.includes(p1.toLowerCase())) return match;

    return `&lt;${p1}${p2}`;
  });

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
