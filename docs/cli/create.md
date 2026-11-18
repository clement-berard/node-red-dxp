# `create` command

Creates a new Node-RED package, ready to build: `package.json`, TypeScript, Biome, Vitest, a first node, and the
[instructions for AI agents](../ai.md).

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

Without options, the command asks (with [@clack/prompts](https://github.com/bombshell-dev/clack)):

| Question | Default |
|---|---|
| Package name | `node-red-contrib-my-awesome-lib` |
| Description | `Awesome Node-RED nodes` |
| Editor of the nodes | `Svelte` (or `Classic`: html/pug + typescript) |
| Name of the first node | `my-node` |
| Instructions for AI coding agents | yes |
| Install the dependencies | yes |

Then it writes the files, installs the dependencies with the package manager that launched the command (`pnpm`, `npm`,
`yarn`, `bun`) and runs a first build to check the result.

## Usage

```shell
Usage: node-red-dxp create [options] [name]

Arguments:
  name                  Package name, e.g. @scope/node-red-contrib-my-lib

Options:
  --description <text>  Package description
  --editor <editor>     Kind of editor of the first node (choices: "svelte", "classic")
  --node <name>         Name of the first node
  --pm <name>           Package manager used to install (default: the one running the CLI)
  --no-install          Do not install the dependencies
  --no-ai               Do not write the AI instructions (AGENTS.md, CLAUDE.md)
  -y, --yes             Do not prompt: use the defaults for what is not given
```

The project is created in a folder named after the package, without its scope
(`@me/node-red-contrib-foo` → `./node-red-contrib-foo`). The folder must be missing or empty.

Without a terminal (CI, pipe) the command never prompts: it behaves as with `--yes`.

```sh
# no question, Svelte, no install
npx @keload/node-red-dxp create @me/node-red-contrib-foo --yes --no-install
```

## Result

```sh
node-red-contrib-foo/
├── src/nodes/my-node/
│   ├── controller.ts
│   ├── my-node.svelte      # or editor/index.{ts,html} with --editor classic
│   ├── types.ts
│   ├── docs.md
│   └── locales/en-US.json
├── AGENTS.md  CLAUDE.md    # AI instructions (see ../ai.md)
├── package.json  tsconfig.json  biome.json  vitest.config.ts
├── .node-red-dxprc.json    # uses the Node-RED installed in the project for `dev`
└── README.md  .gitignore
```

Then `cd` into the folder and run `dev` (Node-RED with live reload) or `build`.
