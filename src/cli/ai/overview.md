# node-red-dxp — project guide for AI agents

This project is a Node-RED package built with `@keload/node-red-dxp` ("dxp"). dxp compiles `src/` into `dist/`
(controller bundle, editor bundle, locales, help). Full docs: https://clement-berard.github.io/node-red-dxp/

## Layout

```
src/
├── nodes/<node>/            one folder per node (the folder name is the node type)
│   ├── controller.ts        runtime (Node-RED server side), mandatory
│   ├── <node>.svelte        editor of a Svelte node (definition + form), see svelte-node.md
│   ├── editor/              editor of a classic node (index.ts + index.html|pug), see classic-node.md
│   ├── docs.md | docs.mdx   help shown in the Node-RED sidebar (optional)
│   ├── locales/<lang>.json  translations of this node (optional)
│   └── types.ts             typed properties of the node (convention)
├── locales/<lang>.json      translations shared by all nodes (optional)
├── styles.scss              global editor styles (optional)
└── red-server.ts            custom Node-RED backend endpoints (optional)
resources/                   global JS/CSS injected in the editor (optional)
.node-red-dxprc.json         dxp configuration (optional)
```

A node is a **Svelte node** when `src/nodes/<node>/<node>.svelte` exists, **classic** otherwise. Both kinds can live in
the same package. **Prefer Svelte for every new node.**

## Commands

| Command | Use |
|---|---|
| `node-red-dxp create-node` | scaffold a node (Svelte by default); flags `--name`, `--config-node`/`--regular-node`, `--editor svelte\|classic`, `--category`, `--color`, `--yes` |
| `node-red-dxp build` | production build into `dist/` (`--no-minify` to debug) |
| `node-red-dxp watch` | Node-RED + live reload while developing |
| `node-red-dxp ai` | (re)write the dxp block of `AGENTS.md` |
| `node-red-dxp info` | print the resolved context and configuration |

Use the scripts of `package.json` (`build`, `dev`, `test`, `lint`, `typecheck`).

## Rules

- Never edit `dist/` or `.node-red-dxp/`: generated.
- Adding a node = `node-red-dxp create-node`, then edit the generated files. Do not copy a folder by hand.
- `controller.ts` default export is the node function (`this`, `config`); it may export `credentials`.
- Saved node properties are the keys of `defaults`: renaming one breaks the nodes already in users' flows. Add keys,
  keep old ones working.
- The published package contains `dist/` only and has **no runtime dependency**: dxp bundles what the controller imports.
  Do not add `svelte`, `svelte-check` or any build tool to this package: Svelte comes with dxp.
- `.svelte` files are compiled by dxp, not type-checked by `tsc`: keep logic that needs checking in `.ts` files.
- Run `build` after changes to editor files, and check the result in a real Node-RED (`dev`) for editor work.

## Guides

Read the one that matches the task (paths relative to this folder):

- `svelte-node.md` — write or change a Svelte node (definition, components, config nodes, credentials, i18n).
- `classic-node.md` — maintain a classic (html/pug + ts) node.
- `migrate-to-svelte.md` — convert a classic node to Svelte, step by step.
