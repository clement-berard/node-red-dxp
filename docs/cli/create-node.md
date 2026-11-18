# `create-node` command

Adds a node to the current package, in `src/nodes/<name>/`. A **Svelte** node by default; `--editor classic` gives the
html + typescript editor. You can create a regular node or a config node.

## Usage

```shell
Usage: node-red-dxp create-node [options]

Options:
  --name <name>       Node name
  --config-node       Generate a config node
  --regular-node      Generate a regular node
  --editor <editor>   Kind of editor (choices: "svelte", "classic")
  --category <name>   Palette category of a regular node
  --color <hex>       Palette color of a regular node
  -y, --yes           Do not prompt: use the defaults for what is not given
  -h, --help          display help for command
```

### Usage examples

```bash
# Without parameters, it asks for the name, the kind of node and the editor
node-red-dxp create-node

node-red-dxp create-node --name "my-node-1" --regular-node --yes
node-red-dxp create-node --name "my-server" --config-node --editor svelte --yes
node-red-dxp create-node --name "legacy" --editor classic --yes
```

The **palette category** of a regular node is proposed from the package: the category already used by your other nodes
(the most used one), otherwise the package name without scope and `node-red-contrib-` prefix
(`@me/node-red-contrib-my-lib` → `my-lib`). Change it with the prompt or `--category`. A config node has no palette
category.

The **color** follows the category: the one of the existing nodes of that category, otherwise a soft color derived
from the category name (always the same for a given name). Override with `--color #a6bbcf`.

The name is normalized (`My Node` → `my-node`). The command refuses to overwrite an existing node. Without a terminal,
or with `--yes`, whatever is not given takes its default: a regular Svelte node. `--name` is then required.

::: tip Former flag
`--skip-confirm` still works as an alias of `--yes`. Note that the default editor is now Svelte: pass
`--editor classic` for the previous result.
:::

## Result

:::tabs
== Svelte
```sh
├── my-node-1/
│   ├── controller.ts          # runtime (mandatory)
│   ├── my-node-1.svelte       # definition + form of the editor, see /svelte/
│   ├── types.ts               # typed properties of the node
│   ├── docs.md                # help of the node (optional)
│   └── locales/en-US.json     # translations used by the form (optional)
```
== Classic
```sh
├── my-node-1/
│   ├── controller.ts          # runtime (mandatory)
│   ├── editor/
│   │   ├── index.html         # form (mandatory)
│   │   ├── index.ts           # definition (mandatory)
│   │   └── styles.scss        # styles (optional)
│   ├── types.ts
│   └── docs.md
```
:::

A config node comes with `credentials` (user, password) in both editors.
