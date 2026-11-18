<div align="center">

# Node-RED DXP

**Build Node-RED nodes the way you build a modern web app.**<br/>
One command to scaffold, one file per editor, instant rebuilds.

[![npm](https://img.shields.io/npm/v/@keload/node-red-dxp?color=a6bbcf)](https://www.npmjs.com/package/@keload/node-red-dxp)
[![license](https://img.shields.io/npm/l/@keload/node-red-dxp?color=a6bbcf)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-VitePress-a6bbcf)](https://clement-berard.github.io/node-red-dxp/)

[**Get started**](https://clement-berard.github.io/node-red-dxp/get-started) ·
[Documentation](https://clement-berard.github.io/node-red-dxp/) ·
[Svelte editor](https://clement-berard.github.io/node-red-dxp/svelte/) ·
[AI guides](https://clement-berard.github.io/node-red-dxp/ai)

<br/>

<img src="https://nodered.org/about/resources/media/node-red-icon-2.svg" alt="Node-RED logo" width="50"/>&nbsp;&nbsp;
<img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="TypeScript logo" width="40"/>&nbsp;&nbsp;
<img src="./docs/images/esbuild-logo.svg" alt="esbuild logo" width="50"/>&nbsp;&nbsp;
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind CSS logo" width="50"/>&nbsp;&nbsp;
<img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="Sass logo" width="50"/>&nbsp;&nbsp;
<img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg" alt="Svelte logo" width="40"/>

</div>

## Why

Writing a Node-RED node means juggling a runtime, an editor form, styles, help pages and translations, each with its
own tooling. **node-red-dxp** replaces that setup with one CLI and one toolchain:

- **Fast.** esbuild bundles the runtime and the editor, and `watch` rebuilds on every save.
- **All-in-one.** TypeScript, SCSS, Tailwind, Markdown help and i18n are handled for you.
- **Pleasant.** Write your editor as a reactive Svelte component, not as hand-wired DOM and ids.
- **Agent-ready.** Generated projects ship guides that AI coding agents can follow.

## Start in one command

```bash
npx @keload/node-red-dxp create
```

The wizard scaffolds your package (Svelte or classic editor), installs the dependencies and runs a first build.
Then:

```bash
pnpm dev   # rebuild on every change
```

## One file per editor

With the Svelte editor, the whole editor of a node lives in `src/nodes/<node>/<node>.svelte`: the Node-RED
definition on top, a reactive form below. No show/hide code, no ids, no `getFormValues`.

```svelte
<script module lang="ts">
  export const definition = { category: 'my category', color: '#a6bbcf', icon: 'font-awesome/fa-flask' };
  export const defaults = { name: { value: '' }, mode: { value: 'simple' }, delay: { value: '0' } };
</script>

<script lang="ts">
  import { Input, Row, Select, Spinner, useT } from '@keload/node-red-dxp/ui';

  let { node } = $props();
  const t = useT();
</script>

<Row label={t('name')}><Input bind:value={node.name} /></Row>
<Row label={t('mode')}><Select bind:value={node.mode} options={['simple', 'advanced']} /></Row>

{#if node.mode === 'advanced'}
  <Row label={t('delay')}><Spinner bind:value={node.delay} min={0} /></Row>
{/if}
```

Svelte is optional: classic nodes (pug + TypeScript) keep working side by side.
[Read more »](https://clement-berard.github.io/node-red-dxp/svelte/)

## Features

- **⚡ Fast builder**: esbuild for the controller and the editor, SCSS for the editor UI, Markdown help rendered
  into Node-RED compatible HTML.
- **🎨 Styling**: built-in Tailwind CSS, plus clean minimal CSS tailored for Node-RED and fully customizable SCSS.
- **🧩 Svelte editor**: ready-made components for Node-RED widgets (typed input, config node select, code editor,
  lists...).
- **🤖 Wizard and AI-ready**: `create` scaffolds a package and ships guides for AI coding agents
  (`AGENTS.md` / `CLAUDE.md`) that always match the installed version.
  [Read more »](https://clement-berard.github.io/node-red-dxp/ai) · Start from zero with an agent:
  [llms.txt](https://clement-berard.github.io/node-red-dxp/llms.txt)
- **🛠️ Development helpers**: utilities to streamline custom node editors and hassle-free configuration for common
  Node-RED workflows.

## Built with node-red-dxp

- [node-red-contrib-ultimate-toolkit](https://www.npmjs.com/package/@keload/node-red-contrib-ultimate-toolkit)
- [node-red-contrib-js-philips-tv-control](https://www.npmjs.com/package/@keload/node-red-contrib-js-philips-tv-control)
- [node-red-contrib-happy-http-client](https://www.npmjs.com/package/@keload/node-red-contrib-happy-http-client)
- [node-red-contrib-better-webdav](https://www.npmjs.com/package/@keload/node-red-contrib-better-webdav) 🏗️

## Upgrading from v1

v2 has a few breaking changes: see the [migration guide](https://clement-berard.github.io/node-red-dxp/migration-v1-to-v2).
v1 is kept in maintenance on the [`v1` branch](https://github.com/clement-berard/node-red-dxp/tree/v1)
(`npm i @keload/node-red-dxp@v1`).

## License

MIT
