# Manual setup

::: tip New project?
[Your first node](/guide/first-node) walks through the scaffolded project. This page is for adding dxp to an existing
package by hand.
:::

You can scaffold a new application instantly using the CLI or set it up manually.
The wizard creates the package, a first node (Svelte or classic), installs the dependencies and writes the
[instructions for AI agents](./ai.md). See [`create`](./cli/create.md).

## Quick Start (Recommended)

Run the creation command directly:

:::tabs
== pnpx
```sh
pnpx @keload/node-red-dxp create
```
== npx
```sh
npx @keload/node-red-dxp create
```
:::


## Manual Setup

If you prefer to configure the project yourself:

### Initialize a project

Run `npm init -y` (or use your preferred package manager).

### Install the dependency

Add the package as a development dependency:

```sh
npm install @keload/node-red-dxp --dev // [!=npm auto]
```

### Create the structure

Set up your project files following the structure below (a node is either **Svelte**, with `<node>.svelte`, or
**classic**, with an `editor/` folder; `node-red-dxp create-node` generates either):

```sh
├── src/
│   ├── locales/ # Your global translations (optional)
│   │   ├── en-US.json
│   │   └── fr.json
│   ├── nodes/ # Your nodes (mandatory)
│   │   ├── my-node-1/
│   │   │   ├── controller.ts # Your node controller (mandatory)
│   │   │   ├── docs.md(x) # Your node documentation (optional)
│   │   │   ├── my-node-1.svelte # Your node editor, Svelte (instead of editor/)
│   │   │   ├── editor/ # Your node editor folder (classic nodes)
│   │   │   │   ├── index.{html,pug} # Your node editor HTML/Pug (mandatory)
│   │   │   │   └── index.ts # Your node editor script (mandatory)
│   │   │   │   └── styles.scss # Your node editor styles (optional)
│   │   │   ├── locales/ # Your node translations (optional)
│   │   │   │   ├── en-US.json
│   │   ├── ... # Your other nodes
│   └── styles.scss # Your global styles (optional)
│   └── red-server.ts # Use to interact with Node-RED backend (optional)
└── resources/ # Your resources folder (optional)
└── tsconfig.json # Your Typescript configuration
└── .node-red-dxprc.json # Your configuration file (optional)
└── package.json
```

| Path | Requirement | Description |
| :--- | :--- | :--- |
| `src/nodes` | **Mandatory** | This folder contains all of your nodes. |
| `src/nodes/<node_name>/controller.ts` | **Mandatory** | This file contains the logic of your node (server-side). |
| `src/nodes/<node_name>/<node_name>.svelte` | **Mandatory*** | The editor of a [Svelte node](./svelte/index.md): definition and form in one file. |
| `src/nodes/<node_name>/editor` | **Mandatory*** | The editor of a classic node. *One of the two, per node. |
| `src/nodes/<node_name>/editor/index.{html,pug}` | *Classic* | This file contains the HTML or Pug of your node editor. Pug file is prioritized over HTML file. |
| `src/nodes/<node_name>/editor/index.ts` | *Classic* | This file contains the script of your node editor. |
| `src/nodes/<node_name>/editor/styles.scss` | *Optional* | This file contains the styles of your node editor. |
| `src/locales` | *Optional* | This folder contains global translations for your nodes. Each file should be named according to the language code it represents (example: `en-US.json`). |
| `src/red-server.ts` | *Optional* | This file is used to interact with the Node-RED backend. |

### `tsconfig.json`

This file contains your TypeScript configuration.

Add `@keload/node-red-dxp` to your `compilerOptions.types` array to get the types of the package.

### Important things to know ⚠️

You need to add information in some files to make the package work correctly.

:::tabs
== package.json
```json
{
  "engines": {
    "node": ">=18" // adjust to your Node.js version
  },
  "node-red": {
    "version": ">=2.0.0", // adjust to your Node-RED version
    "nodes": {
      "all": "dist/index.js" // required
    }
  },
  "scripts": {
    "build": "node-red-dxp build",
    "watch": "node-red-dxp watch"
  }
}
```
== tsconfig.json
```json
{
  "compilerOptions": {
    // another options
    "types": ["@keload/node-red-dxp"]
  }
}
```
:::
