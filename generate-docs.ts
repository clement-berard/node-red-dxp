import { exec } from 'node:child_process';
import { unlinkSync, writeFileSync } from 'node:fs';
import { promisify } from 'node:util';
// @ts-expect-error TS6 - No types exports in this package
import yaml from 'js-yaml';
import type { TypeDocOptions } from 'typedoc';
import type { PluginOptions } from 'typedoc-plugin-markdown';
import { zod2md } from 'zod2md';
import { defaultConfig } from './src/default-config';

const execAsync = promisify(exec);

const baseConfig: Partial<TypeDocOptions & PluginOptions> = {
  exclude: ['**/node_modules/**', 'dist', 'tests', '**/*.spec.ts'],
  validation: false,
  skipErrorChecking: true,
  plugin: ['typedoc-plugin-markdown'],
  excludePrivate: true,
  excludeProtected: true,
  hideGenerator: true,
  cleanOutputDir: false,
  disableSources: true,
  mergeReadme: true,
  outputFileStrategy: 'modules',
  hideBreadcrumbs: false,
  hidePageHeader: true,
  hidePageTitle: false,
  indexFormat: 'table',
  parametersFormat: 'htmlTable',
  interfacePropertiesFormat: 'htmlTable',
  propertyMembersFormat: 'htmlTable',
  typeDeclarationFormat: 'htmlTable',
  enumMembersFormat: 'htmlTable',
  typeAliasPropertiesFormat: 'htmlTable',
  classPropertiesFormat: 'htmlTable',
  flattenOutputFiles: true,
  strikeDeprecatedPageTitles: true,
  useCodeBlocks: true,
};

const targets: Partial<TypeDocOptions & PluginOptions>[] = [
  {
    name: 'Editor / DOM Helper',
    entryPoints: ['src/editor/dom.ts'],
    outputFileStrategy: 'members',
    out: 'docs/editor',
    excludeExternals: true,
    externalPattern: ['**/node_modules/**'],
    entryFileName: 'dom-helper.md',
    readme: 'docs/editor/dom-helper-header.md',
  },
  {
    name: 'Utils / Controller',
    entryPoints: ['src/utils/server-side/controller.ts'],
    outputFileStrategy: 'members',
    out: 'docs/utils/controller',
    excludeExternals: false,
    entryFileName: 'utils-controller.md',
    readme: 'docs/utils/utils-controller-header.md',
  },
  {
    name: 'Utils / Full Stack',
    entryPoints: ['src/utils/index.ts'],
    outputFileStrategy: 'members',
    exclude: ['dist', 'tests', '**/*.spec.ts'],
    out: 'docs/utils',
    excludeExternals: false,
    entryFileName: 'utils-full-stack.md',
    readme: 'docs/utils/utils-full-stack-header.md',
  },
];

async function buildTypeDoc(): Promise<void> {
  console.log('🚀 Starting TypeDoc builds...\n');

  const buildPromises = targets.map(async (target, index) => {
    const entry = target.entryPoints ? target.entryPoints[0] : 'Unknown';
    const tmpFile = `typedoc.${index}.tmp.json`;

    console.log(`📄 Building: ${entry}`);

    const finalConfig = { ...baseConfig, ...target };
    writeFileSync(tmpFile, JSON.stringify(finalConfig, null, 2));

    try {
      await execAsync(`npx typedoc --options ${tmpFile} --logLevel Error`);
    } catch (error: unknown) {
      throw new Error(
        `TypeDoc failed for ${target.name || 'Unknown'}: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      try {
        unlinkSync(tmpFile);
      } catch {}
    }
  });

  await Promise.all(buildPromises);
  console.log('✅ TypeDoc done!\n');
}

async function buildConfigDoc(): Promise<void> {
  console.log('🚀 Starting config documentation...\n');

  const markdown = await zod2md({
    entry: 'src/default-config.ts',
    title: 'Models reference',
  });

  let content = markdown.replace(/^.*\n/, '');

  content = content.replace(/<([a-zA-Z0-9_]+)([\s,>[\]])/g, (match: string, p1: string, p2: string): string => {
    const htmlTags: string[] = [
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

  const yamlConfig = yaml.dump(defaultConfig());

  const final = `
## Default configuration / Example

:::tabs
== .node-red-dxprc.yaml
\`\`\`yaml
${yamlConfig}
\`\`\`
== .node-red-dxprc.json
\`\`\`json
${JSON.stringify(defaultConfig(), null, 2)}
\`\`\`
:::

${content}
`;

  writeFileSync('docs/generated-config.md', final.trim(), 'utf-8');
  console.log('✅ Config documentation done!\n');
}

async function main(): Promise<void> {
  try {
    await Promise.all([buildTypeDoc(), buildConfigDoc()]);

    console.log('🎉 All documentation successfully built!');
  } catch (error: unknown) {
    console.error('❌ An error occurred while building documentation:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

main();
