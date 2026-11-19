# Introduction

**node-red-dxp** is a toolchain to build packages of Node-RED nodes: a CLI that scaffolds and builds, a Svelte toolkit
for the editor, and helpers for the runtime.

Writing a node by hand means juggling a runtime, an editor form, styles, a help page and translations, each with its
own tooling. dxp compiles all of it from one folder per node.

## How it fits together

```sh
my-package/
└── src/nodes/my-node/
    ├── my-node.svelte   # editor: definition + form          → bundled into dist/index.html
    ├── controller.ts    # runtime: what happens on a message → bundled into dist/index.js
    ├── docs.md          # help in the Node-RED sidebar
    └── locales/         # translations
```

| You write | dxp builds |
|---|---|
| `controller.ts` | the runtime of the node (Node.js, CommonJS) |
| `<node>.svelte` (or `editor/`) | the editor of the node (browser, one script, scoped CSS) |
| `docs.md` | the help of the node |
| `locales/*.json` | the translations |

## Where to go

- **New here?** [Build your first node](/guide/first-node) (10 minutes).
- **Making the form:** [recipes](/guide/form-recipes) and the [components](/svelte/components).
- **Making the runtime:** [runtime guide](/guide/runtime).
- **Sharing a server or an account between nodes:** [config nodes](/guide/config-node).
- **Shipping:** [test and publish](/guide/test-and-publish).
- **Existing pug nodes:** [migrate to Svelte](/svelte/migration), one node at a time.

## Quick start

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

See [`create`](/cli/create), or the [manual setup](/get-started) for an existing package.

## Bundling strategy

dxp is a development dependency: only `dist/` is published.

**Editor (browser).** One script (IIFE) with everything it needs, so nothing is resolved at runtime.

**Controller (Node.js).** Dependencies are **externals** (`require`d from the installed package). To bundle a library
anyway, list it in the [configuration file](/config-file). The `@keload/node-red-dxp` helpers are always bundled.

## Trusted by community projects

Packages built with dxp: [see the list](https://github.com/topics/node-red-dxp).

<!--@include: ./partials/trusted-projects.md-->
