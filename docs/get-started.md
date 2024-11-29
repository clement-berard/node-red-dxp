# Get started

<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem">
<img src="./images/esbuild-logo.svg" alt="alt text" width="10%"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="alt text" width="10%"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="alt text" width="10%"/>
</div>

::: warning Under construction 🚧
Documentation is still a work in progress. But the package is fully functional and ready to use.
:::

Start to build your own Node-RED node with `node-red-dxp`! 🚀

::: tip To know before starting
To use this tool, your project needs to follow a simple folder structure. 

This structure is straightforward and designed to help you organize your files efficiently, without adding unnecessary complexity. 

By adhering to this structure, you can take full advantage of the tool's features, ensuring a smooth and streamlined development experience.
:::

## Installation

```bash
npm install node-red-dxp
```

## Usage

Typical project structure:

```plaintext
├── src
│   ├── locales <- Your global translations (optional)
│   │   ├── en-US.json
│   │   └── fr.json
│   ├── nodes <- Your nodes (mandatory)
│   │   ├── my-node-1
│   │   │   ├── controller.ts <- Your node controller (mandatory)
│   │   │   ├── docs.md(x) <- Your ndoe documentation (optional)
│   │   │   ├── editor <- Your node editor folder (mandatory)
│   │   │   │   ├── index.html <- Your node editor HTML (mandatory)
│   │   │   │   └── index.ts <- Your node editor script (mandatory)
│   │   │   │   └── styles.scss <- Your node editor styles (optional)
│   │   │   ├── locales <- Your node translations (optional)
│   │   │   │   ├── en-US.json
│   │   ├── ... <- Your other nodes
│   └── styles.scss <- Your global styles (optional)
│   └── red-server.ts <- Use to interact with Node-RED backend (optional)
└── tsconfig.json <- Your Typescript configuration
```

### `src/nodes` _(mandatory)_

This folder contains all your nodes.

#### `src/nodes/<node_name>/controller.ts` _(mandatory)_

This file contains the logic of your node (server-side).

#### `src/nodes/<node_name>/editor` _(mandatory)_

This folder contains the editor of your node.

##### `src/nodes/<node_name>/editor/index.html` _(mandatory)_

This file contains the HTML of your node editor.

##### `src/nodes/<node_name>/editor/index.ts` _(mandatory)_

This file contains the script of your node editor.

##### `src/nodes/<node_name>/editor/styles.scss` _(optional)_

This file contains the styles of your node editor.

---

### `src/locales` _(optional)_

This folder contains globals the translations for your nodes. Each file should be named according to the language code it represents (e.g., `en-US.json`).

More information about the translation system can be found [here](i18n.md).

### `src/red-server.ts` _(optional)_

This file is used to interact with the Node-RED backend.

More information about the red-server can be found [here](server-side.md).

### `tsconfig.json`

This file contains your TypeScript configuration.

Add `@keload/node-red-dxp` to your `compilerOptions.types` array to get the types of the package.
