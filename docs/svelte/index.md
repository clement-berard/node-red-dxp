# Svelte editor

Describe the whole editor of a node in **one file**: `src/nodes/<node>/<node>.svelte`. The form is a reactive
component and the Node-RED definition of the node sits at the top of the same file.

::: tip New to it?
Start with [Your first node](/guide/first-node), then the [form recipes](/guide/form-recipes). This section is the
reference.
:::

```
src/nodes/my-node/
├── my-node.svelte   # definition + form
├── controller.ts    # runtime
└── docs.md          # help
```

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

`bind:value` reads and writes the property of the node, and the `{#if}` follows it: no show/hide code, no ids, no
`getFormValues`.

## How it works

1. At build time, [esbuild](https://esbuild.github.io) compiles the `.svelte` file (the compiler is **not** part of the
   result).
2. In the editor, dxp mounts the component when the dialog opens, on a **copy** of the node properties.
3. **Done** copies the copy back to the node (and calls `onsave` first). **Cancel** just discards it.

## Why use it

|  | Classic (`pug` + `index.ts`) | Svelte |
|---|---|---|
| Fields that depend on others | show/hide by hand with classes | `{#if}` / `$derived` |
| Reading / writing values | `getFormValues`, `setFormValues`, ids | `bind:value={node.x}` |
| Reusable pieces | pug mixins | components |
| Files per node | `index.ts`, `index.pug`, templates, ... | one `.svelte` |
| Size of the editor bundle | smallest | + the Svelte runtime (about 70 KB minified) |

Both styles live together: a package can have classic nodes and Svelte nodes. A node is a Svelte node as soon as
`src/nodes/<node>/<node>.svelte` exists, otherwise the `editor/` folder is used as before.

## Good to know

- **Nothing to install in your package.** `svelte` and the compiler come with dxp and only load when a Svelte node
  exists. A package without Svelte node builds exactly as before.
- Everything stays in the single editor bundle of the package (Svelte runtime included, once).
- The published package contains no Svelte tooling: only the compiled result.

## Pages

- [The node file](./node-file): `definition`, `defaults`, `label`, `onsave`, lifecycle.
- [Components](./components): every component of `@keload/node-red-dxp/ui`.
- [Credentials](./credentials)
- [Config nodes and shared settings](/guide/config-node)
- [Help and i18n](./help-and-i18n)
- [Styling](./styling)
- [TypeScript and IDE](./typescript)
- [Migrate from pug](./migration)
- [Troubleshooting](./troubleshooting)
