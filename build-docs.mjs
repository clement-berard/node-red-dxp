import { execSync } from 'node:child_process';
import { writeFileSync, unlinkSync } from 'node:fs';

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
    hideBreadcrumbs: true,
    hidePageHeader: true,
    hidePageTitle: true,
    parametersFormat: 'table',
    propertiesFormat: 'table',
    flattenOutputFiles: true,
};

const targets = [
    {
        entryPoints: ["src/editor/dom.ts"],
        outputFileStrategy: "members",
        out: "docs/editor",
        excludeExternals: true,
        externalPattern: "**/node_modules/**",
        entryFileName: "dom-helper.md",
        readme: "docs/editor/dom-helper-header.md",
    },
    {
        entryPoints: ["src/utils/server-side/controller.ts"],
        // outputFileStrategy: "members",
        out: "docs/utils",
        excludeExternals: false,
        entryFileName: "utils-controller.md",
        readme: "docs/utils/utils-controller-header.md",
    },
    {
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
    execSync(`npx typedoc --options typedoc.tmp.json`, { stdio: 'inherit' });
}

unlinkSync('typedoc.tmp.json');

console.log('\n✅ Done!');
