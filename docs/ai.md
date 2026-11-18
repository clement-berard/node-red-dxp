# AI instructions

dxp ships with guides written for AI coding agents (Claude Code, Codex, Cursor, Copilot...), so that an agent knows how
the project works **before** it touches it: where the nodes live, how to write a Svelte editor, which components exist,
what must not be done.

## How it works

The guides live in the package, in `node_modules/@keload/node-red-dxp/dist/ai/`, so they always match the installed
version of dxp: updating dxp updates the guides, nothing to copy or keep in sync.

| Guide | Content |
|---|---|
| `overview.md` | layout of a project, commands, rules (read first) |
| `svelte-node.md` | the Svelte node: definition, `node` prop, every component, config nodes, credentials, i18n |
| `classic-node.md` | the classic node: `createEditorNode`, html/pug form, DOM helpers |
| `migrate-to-svelte.md` | step by step conversion of a classic node, with the equivalents table |

The project only holds a short **block** in `AGENTS.md` that points to them:

```md
<!-- node-red-dxp:start -->
## node-red-dxp
...
- `node_modules/@keload/node-red-dxp/dist/ai/overview.md`: layout, commands and rules of the project (read first)
...
<!-- node-red-dxp:end -->
```

`CLAUDE.md` contains `@AGENTS.md`, so Claude Code reads the same file as the other agents.

## Start from zero with an AI

Give your agent this URL (or its content): https://clement-berard.github.io/node-red-dxp/llms.txt

It explains the non-interactive `create` command, so the agent can create the package, then read the guides.

## New project

[`create`](./cli/create.md) writes `AGENTS.md` and `CLAUDE.md` (unless `--no-ai`).

## Existing project

```sh
npm install -D @keload/node-red-dxp@latest
npx node-red-dxp ai
```

Your own content in `AGENTS.md` stays: only the block between the markers is written. Run it again after an update if
you want the block refreshed (the guides themselves are always current).

## Migrating a project with pug to Svelte

Ask your agent, once the block is in place:

> Migrate the node `<name>` from the classic editor to Svelte, following `migrate-to-svelte.md`. Keep the saved
> properties compatible, build, and tell me what to check in Node-RED.

One node at a time: classic and Svelte nodes work together in the same package.
