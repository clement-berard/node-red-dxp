# Usage

::: tip ✨
I am working on a boilerplate solution combined with a CLI command to make starting a new project easier and faster.

However, even if you choose to set it up manually, the process remains straightforward!

Additionally, there is already a CLI command available to add a new node to the project.
You can check it out [here](cli/create-node.md).
:::

💡 Some packages already use `@keload/node-red-dxp` as a dependency. You can check them out:

- [node-red-contrib-ultimate-toolkit](https://www.npmjs.com/package/@keload/node-red-contrib-ultimate-toolkit)️
- [node-red-contrib-js-philips-tv-control](https://www.npmjs.com/package/@keload/node-red-contrib-js-philips-tv-control)
- [node-red-contrib-better-webdav](https://www.npmjs.com/package/@keload/node-red-contrib-better-webdav) 🏗️

## Start a new project manually

Init a new node package with, for example `npm init -y` (or another package manager).

Now you can follow the structure below to start your project.

Typical project structure:

```plaintext
├── src/
│   ├── locales/ <- Your global translations (optional)
│   │   ├── en-US.json
│   │   └── fr.json
│   ├── nodes/ <- Your nodes (mandatory)
│   │   ├── my-node-1/
│   │   │   ├── controller.ts <- Your node controller (mandatory)
│   │   │   ├── docs.md(x) <- Your node documentation (optional)
│   │   │   ├── editor/ <- Your node editor folder (mandatory)
│   │   │   │   ├── index.html <- Your node editor HTML (mandatory)
│   │   │   │   └── index.ts <- Your node editor script (mandatory)
│   │   │   │   └── styles.scss <- Your node editor styles (optional)
│   │   │   ├── locales/ <- Your node translations (optional)
│   │   │   │   ├── en-US.json
│   │   ├── ... <- Your other nodes
│   └── styles.scss <- Your global styles (optional)
│   └── red-server.ts <- Use to interact with Node-RED backend (optional)
└── rercources/ <- Your resources folder (optional)
└── tsconfig.json <- Your Typescript configuration
└── .node-red-dxprc.json <- Your configuration file (optional)
└── package.json
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

## Start a new project with the CLI

Coming soon...
