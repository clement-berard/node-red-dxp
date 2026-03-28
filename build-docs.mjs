import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';

/** @type {import('typedoc').TypeDocOptions & import('typedoc-plugin-markdown').PluginOptions} */
const baseConfig = {
    exclude: ["**/node_modules/**", "dist", "tests", "**/*.spec.ts"],
    validation: false,
    skipErrorChecking: true,
    plugin: ["typedoc-plugin-markdown"],
    excludePrivate: true,
    excludeProtected: true,
    hideGenerator: true,
    cleanOutputDir: false,
    disableSources: true,
    mergeReadme: true,
    outputFileStrategy: "modules",
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
    // expandParameters: true,
    // expandObjects: true,
    useCodeBlocks: true,
};

const targets = [
    {
        name: "Editor / DOM Helper",
        entryPoints: ["src/editor/dom.ts"],
        outputFileStrategy: "members",
        out: "docs/editor",
        excludeExternals: true,
        externalPattern: "**/node_modules/**",
        entryFileName: "dom-helper.md",
        readme: "docs/editor/dom-helper-header.md",
    },
    {
        name: "Utils / Controller",
        entryPoints: ["src/utils/server-side/controller.ts"],
        outputFileStrategy: "members",
        out: "docs/utils/controller",
        excludeExternals: false,
        entryFileName: "utils-controller.md",
        readme: "docs/utils/utils-controller-header.md",
    },
    {
        name: "Utils / Full Stack",
        entryPoints: ["src/utils/index.ts"],
        outputFileStrategy: "members",
        exclude: ["dist", "tests", "**/*.spec.ts"],
        out: "docs/utils",
        excludeExternals: false,
        entryFileName: "utils-full-stack.md",
        readme: "docs/utils/utils-full-stack-header.md",
    }
];

console.log('🚀 Starting TypeDoc builds...\n');

for (const target of targets) {
    const finalConfig = { ...baseConfig, ...target };
    writeFileSync('typedoc.tmp.json', JSON.stringify(finalConfig, null, 2));
    console.log(`📄 Building: ${target.entryPoints[0]}`);
    execSync(`npx typedoc --options typedoc.tmp.json --logLevel Verbose`, { stdio: 'inherit' });
}

unlinkSync('typedoc.tmp.json');

console.log('\n✅ Done!');
