# Components

All the components come from `@keload/node-red-dxp/ui` and work on the `node` prop (see [The node file](./node-file)).

```svelte
<script lang="ts">
  import { Checkbox, CodeEditor, ConfigSelect, Input, List, Row, SearchBox, Select, Spinner, TypedInput, useT } from '@keload/node-red-dxp/ui';
</script>
```

The components set no `id` (except `ConfigSelect`, which Node-RED builds itself): Node-RED binds fields by id
(`node-input-<property>`) and would read them behind your back. `bind:` is the only link between a field and the node.

## `Row`

A line of the form: label on the left, content on the right.

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Text of the label |
| `icon` | `string` | [Font Awesome](https://fontawesome.com/v4/icons/) 4 name without `fa-` (`tag`, `clock-o`...) |
| `class` | `string` | Extra classes on the row |

```svelte
<Row label="Name" icon="tag"><Input bind:value={node.name} /></Row>
```

## `Input`

Text field. It **always binds a string**, whatever the `type`: a value saved by `text` stays the same if you switch to
`number`. Any attribute of `<input>` is accepted (`type`, `placeholder`, `min`, `max`, `step`...).

```svelte
<Input bind:value={node.name} placeholder="my name" />
<Input type="number" min="0" bind:value={node.limit} />
<Input type="time" bind:value={node.start} />
```

## `Select`

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Bindable |
| `options` | `(string \| { value, text })[]` | The choices |
| `empty` | `boolean` | Adds a blank first choice |
| `onchange` | `() => void` | Called when the user picks another choice |

```svelte
<Select bind:value={node.mode} options={['asc', 'desc']} />
<Select bind:value={node.fn} options={functions} empty onchange={() => (node.args = {})} />
```

With an undefined `value`, the first option is selected (and written to `node`).

## `Checkbox`

```svelte
<Checkbox bind:checked={node.pretty} text="Format the JSON" />
```

## `TypedInput`

The Node-RED `typedInput` widget. `value` and `type` are bindable; **every other prop is an option of the widget**
(`types`, `typeField`, `validate`, `autoComplete`, `width`...).

```svelte
<TypedInput bind:value={node.entry} bind:type={node.entryType} />

<!-- only some types -->
<TypedInput bind:value={node.entry} bind:type={node.entryType} types={['msg', 'json']} />

<!-- custom types -->
<TypedInput
  bind:value={rule.source}
  bind:type={rule.sourceType}
  types={[{ value: 'result', label: 'result', hasValue: false }, 'msg', 'str']}
/>
```

- `types` is an **array**, one entry per type (`['msg', 'json']`, not `'msg,json'`).
- Default `types`: `msg`, `flow`, `global`, `str`, `json`, `jsonata`, `env`.
- If the current `type` is not in `types` (a node saved before you restricted them), the **first allowed type** is used
  and written to the bound `type`. Without that, the widget breaks its layout.

## `ConfigSelect`

The select of a config node (MQTT broker, server...) with the edit and add buttons of Node-RED.

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Bindable: the id of the config node |
| `type` | `string` | Type of the config node |
| `property` | `string` | Name of the property of the node |
| `filter` | `(configNode) => boolean` | Keeps only some config nodes |

```svelte
<script module lang="ts">
  export const defaults = { server: { value: '', type: 'mqtt-broker', required: true } };
</script>

<Row label="Server"><ConfigSelect bind:value={node.server} type="mqtt-broker" property="server" /></Row>
```

The property must be declared in `defaults` with its `type`. Creating a config node from the add button selects it.

## `CodeEditor`

The Node-RED code editor (Monaco).

| Prop | Type | Description |
|---|---|---|
| `value` | `string` | Bindable |
| `mode` | `string` | Language: `text` (default), `json`, `javascript`, `markdown`, `html`... |
| `height` | `string` | Default `200px` |
| `options` | `object` | Extra options passed to `RED.editor.createEditor` |

```svelte
<Row label="Payload"><CodeEditor bind:value={node.template} mode="json" height="300px" /></Row>
```

## `Spinner`

Number field with arrows (jQuery UI `spinner`). Binds a string.

```svelte
<Spinner bind:value={node.count} min={0} max={10} step={1} />
```

## `SearchBox`

Text field with a search icon and a clear button.

```svelte
<SearchBox bind:value={node.query} delay={300} />
```

## `List`

Rows that can be added, removed and reordered (drag and drop).

| Prop | Type | Description |
|---|---|---|
| `items` | `T[]` | Bindable array |
| `create` | `() => T` | Builds the item of a new row |
| `row` | `Snippet<[T, number]>` | Renders one row (item, index) |
| `sortable` | `boolean` | Drag and drop, default `true` |

```svelte
<List bind:items={node.rules} create={() => ({ target: 'payload', targetType: 'msg' })}>
  {#snippet row(rule)}
    <TypedInput bind:value={rule.target} bind:type={rule.targetType} types={['msg', 'flow', 'global']} />
    <span>=</span>
    <Input bind:value={rule.source} />
  {/snippet}
</List>
```

The array must exist: declare it in `defaults` (`rules: { value: [] }`).

## `useT`

Translator of the locale files of the node, see [Help and i18n](./help-and-i18n).

## Anything else

For another Node-RED or jQuery widget, use `jQuery` in an `$effect` on an element of your template:

```svelte
<script lang="ts">
  let input: HTMLInputElement;

  $effect(() => {
    const field = jQuery(input);
    field.myWidget({ option: 1 });
    return () => field.myWidget('destroy'); // clean up when the dialog closes
  });
</script>

<input bind:this={input} />
```
