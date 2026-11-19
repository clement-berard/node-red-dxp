---
layout: home

title: Fast TypeScript Node Builder
description: Build custom Node-RED nodes faster with Node-RED DXP. An all-in-one toolkit featuring ultra-fast esbuild, TypeScript support, and automated documentation.

hero:
  name: Node-RED DXP ⚡
  text: Build Node-RED nodes, the modern way
  tagline: Build Node-RED nodes like a modern web app. One command to start, one Svelte file per editor, instant rebuilds.
  actions:
    - theme: brand
      text: Build your first node
      link: /guide/first-node
    - theme: alt
      text: Read the guides
      link: /guide/
    - theme: alt
      text: GitHub
      link: https://github.com/clement-berard/node-red-dxp

features:
  - title: ⚡ Fast builds
    details: esbuild compiles the runtime and the editor, and rebuilds on every save. TypeScript out of the box.
    link: /cli/watch
    linkText: The dev loop
  - title: 🧩 One Svelte file per editor
    details: The form of a node is a reactive component with ready-made Node-RED widgets. Dependent fields, lists, tabs and code editors without show/hide code or ids.
    link: /guide/form-recipes
    linkText: See the recipes
  - title: 🔌 A runtime toolkit
    details: Evaluate typed properties, inherit settings from a config node, set the status, run user scripts. The helpers you would write anyway, tested.
    link: /guide/runtime
    linkText: Write the runtime
  - title: 🎨 Modern styling
    details: Tailwind and SCSS, scoped to your package so nothing leaks into the rest of Node-RED, dark mode included.
    link: /svelte/styling
    linkText: Styling
  - title: 📚 Help and translations
    details: Write the help of a node in Markdown, translate the form with a JSON file per language.
    link: /svelte/help-and-i18n
    linkText: Help and i18n
  - title: 🤖 Agent ready
    details: Generated projects ship guides that AI coding agents follow, so they know the project before they touch it.
    link: /ai
    linkText: AI instructions
---
<br />
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 1rem;">
  <img src="https://img.shields.io/github/stars/clement-berard/node-red-dxp?style=flat&color=yellow" alt="GitHub stars">
  <img src="https://img.shields.io/npm/v/@keload/node-red-dxp?style=flat&color=red" alt="NPM version">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
</div>

<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem; flex-wrap: wrap;">
  <img src="https://nodered.org/about/resources/media/node-red-icon-2.svg" alt="Node-RED logo" width="50"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="TypeScript logo" width="40"/>
  <img src="./images/esbuild-logo.svg" alt="esbuild logo" width="50"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind CSS logo" width="50"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="Sass logo" width="50"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/1b/Svelte_Logo.svg" alt="Svelte logo" width="40"/>
</div>

## Start in one command

```sh
npx @keload/node-red-dxp create
cd node-red-contrib-my-awesome-lib && pnpm dev
```

A package, a first node, a local Node-RED with live reload. [Follow the first guide »](/guide/first-node)

## The editor of a node, in one file

```svelte
<script module lang="ts">
  export const definition = { category: 'my category', color: '#a6bbcf', icon: 'font-awesome/fa-flask' };
  export const defaults = { name: { value: '' }, mode: { value: 'simple' }, delay: { value: '0' } };
</script>

<script lang="ts">
  import { Input, Row, Select, Spinner } from '@keload/node-red-dxp/ui';
  let { node } = $props();
</script>

<Row label="Name"><Input bind:value={node.name} /></Row>
<Row label="Mode"><Select bind:value={node.mode} options={['simple', 'advanced']} /></Row>

{#if node.mode === 'advanced'}
  <Row label="Delay"><Spinner bind:value={node.delay} min={0} /></Row>
{/if}
```

## What you get

| | |
|---|---|
| ⚡ **Fast builds** | esbuild for the runtime and the editor, rebuild on every save |
| 🧩 **Svelte 5 editor** | one file per node, or keep the classic pug/HTML editor: both live together |
| 🔌 **Runtime helpers** | typed properties, inheritance from a config node, status, user scripts |
| 📚 **Help and i18n** | Markdown help in the sidebar, translations per node |
| 🎨 **Styling** | Tailwind and SCSS scoped to your package |
| 🤖 **Agent ready** | generated projects ship guides for AI coding agents |

## 💪 Trusted by Community Projects

These open-source nodes are already built using the **Node-RED DXP** workflow:

<!--@include: ./partials/trusted-projects.md-->
