import fsPromise from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Plugin } from 'esbuild';
import { glob } from 'fast-glob';
import { currentContext, type ListNodesFull } from '../../current-context';

// Every `svelte` import (nodes, dxp runtime and ui) resolves to the copy of dxp: two runtimes in one bundle would
// double its size and split the reactivity in two. Node packages do not have to install svelte
function getSvelteResolvePlugin(): Plugin {
  const svelteDir = path.dirname(createRequire(__filename).resolve('svelte/package.json'));
  const resolveDir = path.resolve(svelteDir, '..', '..');

  return {
    name: 'dxp-svelte-resolve',
    setup(build) {
      build.onResolve({ filter: /^svelte(\/.*)?$/ }, (args) => {
        if (args.pluginData?.dxpSvelte) {
          return undefined;
        }
        return build.resolve(args.path, { kind: args.kind, resolveDir, pluginData: { dxpSvelte: true } });
      });
    },
  };
}

// `.svelte` files are compiled by esbuild at build time: neither the compiler nor the plugin reach the editor bundle.
// Loaded on demand: a package without svelte node never pays for it
export async function getSveltePlugins(): Promise<Plugin[]> {
  const { default: sveltePlugin } = await import('esbuild-svelte');
  return [
    getSvelteResolvePlugin(),
    sveltePlugin({
      compilerOptions: { css: 'injected', runes: true },
      // the Node-RED editor is not a public web page
      filterWarnings: (warning) => !warning.code.startsWith('a11y_'),
    }),
  ];
}

// Tailwind only sees the markup it is given: hand it the svelte sources (nodes + dxp ui components) too
export async function getSvelteSources(nodes: ListNodesFull): Promise<string> {
  const svelteNodes = nodes.filter((node) => node.editor.hasSvelte);
  if (!svelteNodes.length) {
    return '';
  }

  // `cwd` instead of a path inside the pattern: a glob pattern cannot hold the backslashes of a Windows path
  const uiDir = path.join(currentContext.currentPackagedDistPath, 'ui');
  const files = await Promise.all([
    ...svelteNodes.map((node) => glob('**/*.svelte', { cwd: node.fullPath, absolute: true })),
    glob('*.svelte', { cwd: uiDir, absolute: true }),
  ]);
  const sources = await Promise.all(files.flat().map((file) => fsPromise.readFile(file, 'utf8')));

  return sources.join('\n');
}
