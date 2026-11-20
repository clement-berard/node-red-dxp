# Svelte node (`src/nodes/<node>/<node>.svelte`)

Svelte 5 with runes. One file holds the Node-RED definition (module script) and the editor form (instance script +
markup). `controller.ts`, `docs.md(x)` and `locales/` stay separate files.

```svelte
<script module lang="ts">
  import type { SvelteNodeConfig } from '@keload/node-red-dxp/editor/svelte';
  import type { NodeMyNodeProps } from './types';

  export const definition: SvelteNodeConfig<NodeMyNodeProps>['definition'] = {
    category: 'my category', color: '#a6bbcf', icon: 'font-awesome/fa-wrench',
  };
  export const defaults: SvelteNodeConfig<NodeMyNodeProps>['defaults'] = {
    name: { value: '' },
    mode: { value: 'simple', required: true },
  };
  export function label(this: NodeMyNodeProps) { return this.name || 'my node'; }
</script>

<script lang="ts">
  import { Input, Row, Select, useT } from '@keload/node-red-dxp/ui';
  let { node }: { node: NodeMyNodeProps } = $props();
  const t = useT();
</script>

<Row label={t('name')} icon="tag"><Input bind:value={node.name} /></Row>
<Row label={t('mode')}><Select bind:value={node.mode} options={['simple', 'advanced']} /></Row>
{#if node.mode === 'advanced'}
  <Row label={t('delay')}><Input type="number" bind:value={node.delay} /></Row>
{/if}
```

## Module script exports (all read by dxp)

| Export | Required | Meaning |
|---|---|---|
| `defaults` | yes | Node-RED `defaults`: the saved properties (`value`, `required`, `validate`, `type` for config nodes) |
| `definition` | no | `category`, `color`, `icon`, `inputs`, `outputs`, `paletteLabel`, `credentials`... (`inputs`/`outputs` default to 1) |
| `label` | no | `function (this)` label of the node |
| `outputLabels` | no | `function (this, index)` label of an output |
| `onsave` | no | `function (values)` last adjustment before copy to the node (e.g. set `outputs` when it is in `defaults`) |

## The `node` prop

- A deep reactive **copy** of the properties: nothing reaches the real node until Done; Cancel discards.
- Only keys of `defaults` are saved. A key missing on an old node takes its default.
- Bind with `bind:value={node.x}`. Visibility and dependent values: `{#if}`, `$derived`, `onchange` — no show/hide code.
- Components set no DOM `id`: never rely on `#node-input-x` (except `ConfigSelect`).
- Credentials are in `node.credentials.<name>`; declare them in `definition.credentials` AND `export const credentials`
  in `controller.ts`. They are not in `defaults`. A stored password shows `__PWRD__` (unchanged unless edited).

## Components (`@keload/node-red-dxp/ui`)

| Component | Props |
|---|---|
| `Row` | `label`, `icon` (Font Awesome 4 name without `fa-`), `field` (property name: red outline when it breaks its `required`/`validate` rule in `defaults`), `class`; wraps one field |
| `Input` | `bind:value` (always a string), any `<input>` attribute (`type`, `min`, `placeholder`...) |
| `Select` | `bind:value`, `options` (`string[]` or `{value,text}[]`), `empty`, `onchange` |
| `Checkbox` | `bind:checked`, `text` |
| `TypedInput` | `bind:value`, `bind:type`, `types` (array: `['msg','json']`, custom `{value,label,hasValue}`), other props = widget options |
| `TypedField` | whole line for `<field>` + `<field>Type`: `node`, `field`, `label`, `icon`, `valueType`, `inherit` (`{value,label}`, choice without value), `readonly`, `extraTypes`, `allowEmpty` (default true: an empty value is not outlined in red), `hint`, `placeholder`. Defaults: `typedFieldDefaults(field, { value, valueType, type })` from `@keload/node-red-dxp/editor/svelte` |
| `ConfigSelect` | `bind:value`, `type` (config node type), `property` (key in `defaults`, declared with `type`), `filter` |
| `CodeEditor` | `bind:value`, `mode` (`json`, `javascript`...), `height`, `options`, `expand` (full screen button) |
| `Tabs` | `tabs` (labels), snippet `children(activeTab)`: render the content of the active tab only |
| `Hint` | `state`, `icon`, `fullWidth`; small text under a field |
| `Button` | `state` (`idle`, `loading`, `success`, `error`: owned by the parent), `disabled`, `primary`, `icon`, `onclick`, snippet `children` |
| `Separator` | `label`; a titled line between groups of rows |
| `Spinner` | `bind:value`, `min`, `max`, `step` |
| `SearchBox` | `bind:value`, `delay` |
| `List` | `bind:items` (array declared in `defaults`), `create`, snippet `row(item, index)`, `sortable` |
| `useT()` | `t(key, fallback?)`: translations, missing key → fallback → humanized key |

Other widgets: use `globalThis.jQuery` (`$` is reserved in Svelte) inside `$effect`, with `bind:this`, and clean up in
the returned function.

Gotchas: a `{` in an attribute text is an expression (`hint="{ a }"` leaves the form empty): write `hint={'{ a }'}`; `TypedInput` `types` is an array, never `'msg,json'`; a `typedInput` whose type is not in `types` falls back
to the first one; `data-i18n` does not work, use `t()`.

## Config node

`definition.category = 'config'`, `credentials` in `definition` if needed. Used by another node with
`defaults: { server: { value: '', type: 'my-server', required: true } }` and
`<ConfigSelect bind:value={node.server} type="my-server" property="server" />`; the controller reads it with
`RED.nodes.getNode(config.server)`.

## i18n and help

- Labels: `t('key')` with `src/nodes/<node>/locales/<lang>.json` (flat `{ "key": "text" }`) or `src/locales/<lang>.json`.
  Add a key to every language file. Files are named after the Node-RED language (`en-US.json`, `fr.json`).
- In `label`/`outputLabels`: `this._('<node>.<key>', { defaultValue: '...' })`.
- Help: `docs.md` (or `docs.mdx`), unchanged by Svelte.

## Checklist for a change

1. Edit `<node>.svelte` (+ `types.ts`, `controller.ts`, locales, docs).
2. `build` must pass; `tsc --noEmit` covers `.ts` only.
3. Check in Node-RED (`dev`): open, edit, Done, reopen (values kept), Cancel (nothing changed), old saved nodes still open.

## Fields shared by several nodes

Do not copy rows between nodes: put them in a `.svelte` component (relative import) taking `node`, and when a config node
and its nodes have the same settings describe them once in a `.ts` spec that generates both the rows and the
`defaults` (docs: guide "Config nodes and shared settings").

## Controller helpers (`@keload/node-red-dxp/utils/controller`)

Before writing resolution code in `controller.ts`, use: `useControllerNode(node, msg)` → `evalProps(bag, { key: default })`
(typed properties), `resolveInherited({ node, parent, inheritType, fields })` (value taken from the config node when
`<key>Type === inheritType`; gives `value`, `own`, `parent`), `useNodeStatus(node)` (`success`/`warning`/`error`/`reset`
with the time), `runUserScript(body, argNames, argValues)` (scripts written in a `CodeEditor`), `getREDNode(id)`,
`splitBooleanOutputs`.
