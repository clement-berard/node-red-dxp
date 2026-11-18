# The node file

`src/nodes/<node>/<node>.svelte` has two scripts: the **module** script exports the Node-RED definition, the
**instance** script and the markup are the form.

```svelte
<script module lang="ts">
  // Node-RED definition (exports read by dxp)
  export const definition = { category: 'toolkit', color: '#8EA3A6', icon: 'font-awesome/fa-wrench' };
  export const defaults = { name: { value: '' }, count: { value: '3', validate: RED.validators.number() } };
  export function label(this: { name: string }) { return this.name || 'my node'; }
</script>

<script lang="ts">
  // The form
  let { node } = $props();
</script>
```

## Exports of the module script

| Export | Required | Description |
|---|---|---|
| `defaults` | yes | Node-RED [`defaults`](https://nodered.org/docs/creating-nodes/node-html#node-definition): the properties saved with the node. `required`, `validate` and `type` (config node) work as usual |
| `definition` | no | Everything else Node-RED accepts at registration: `category`, `color`, `icon`, `inputs`, `outputs`, `paletteLabel`, `credentials`... (`inputs` and `outputs` default to `1`) |
| `label` | no | `function (this)`: the label of the node in the workspace |
| `outputLabels` | no | `function (this, index)`: the label of an output |
| `onsave` | no | `function (values)`: adjust the values just before they are copied to the node (e.g. set `outputs`) |

`this` in `label` and `outputLabels` is the node. The type `SvelteNodeConfig<TProps>` of
`@keload/node-red-dxp/editor/svelte` describes these exports.

## The `node` prop

The component receives the properties of the node as a reactive object:

```svelte
<script lang="ts">
  let { node } = $props();
</script>

<Input bind:value={node.name} />
<p>{node.name.length} characters</p>
```

- It is a **copy**: nothing reaches the real node until **Done**, **Cancel** discards everything.
- It is **deeply reactive**: objects and arrays (`node.items.push(...)`, `node.options.verbose = true`) work.
- Only the keys declared in `defaults` are saved. Anything else is lost on close.
- A property missing on a node saved by an older version takes its `defaults` value.

## Reacting to other fields

Use the runes of Svelte 5:

```svelte
<script lang="ts">
  let { node } = $props();

  const isAdvanced = $derived(node.mode === 'advanced');
  const functions = $derived(listFunctions(node.category));
</script>

{#if isAdvanced}
  <Row label="Delay"><Spinner bind:value={node.delay} /></Row>
{/if}
```

To reset a field when another one changes, use the `onchange` of the component:

```svelte
<Select bind:value={node.category} options={categories} onchange={() => (node.function = '')} />
```

## Lifecycle

| Node-RED hook | What dxp does |
|---|---|
| `oneditprepare` | mounts the component on a copy of the properties (and of the credentials) |
| `oneditsave` | calls `onsave(values)`, copies the keys of `defaults` and the credentials to the node, unmounts |
| `oneditcancel` | unmounts |

## Changing the number of outputs

Set `outputs` in `onsave`; it must be declared in `defaults`:

```ts
export const defaults = { split: { value: false }, outputs: { value: 1 } };

export function onsave(values: { split: boolean; outputs: number }) {
  values.outputs = values.split ? 2 : 1;
}
```

## Several nodes

Each node of the package has its own `src/nodes/<node>/<node>.svelte`. Shared pieces are plain Svelte components
imported with a relative path.
