# Build the form

The form of a node is a Svelte component: you describe **what the form looks like for the current values**, and it
follows the values. These recipes cover what most nodes need. Every component is detailed in the
[components reference](/svelte/components).

```svelte
<script lang="ts">
  import { Input, Row } from '@keload/node-red-dxp/ui';
  let { node } = $props(); // the properties of the node, reactive
</script>
```

## A field depends on another one

Use `{#if}`. No show/hide code, no ids.

```svelte
<Row label="Mode"><Select bind:value={node.mode} options={['simple', 'advanced']} /></Row>

{#if node.mode === 'advanced'}
  <Row label="Delay"><Spinner bind:value={node.delay} min={0} /></Row>
{/if}
```

## A value is computed from others

Use `$derived`.

```svelte
<script lang="ts">
  let { node } = $props();
  const functions = $derived(listFunctions(node.category));
</script>

<Row label="Category"><Select bind:value={node.category} options={categories} onchange={() => (node.fn = '')} /></Row>
<Row label="Function"><Select bind:value={node.fn} options={functions} empty /></Row>
```

`onchange` resets the second field when the first one changes.

## A value that can come from a message, a flow variable or a string

Use `TypedInput`, the Node-RED widget. It saves the value **and** its type.

```svelte
<script module lang="ts">
  export const defaults = {
    topic: { value: 'payload' },
    topicType: { value: 'msg' },
  };
</script>

<Row label="Topic">
  <TypedInput bind:value={node.topic} bind:type={node.topicType} types={['msg', 'flow', 'str']} />
</Row>
```

Both `topic` and `topicType` must be in `defaults`. [`TypedField`](/svelte/components#typedfield) does the same with the
label and the hint in one component. The [runtime guide](./runtime#typed-properties) shows how to read
them.

## A list of rules

Use `List`. Rows can be added, removed and reordered.

```svelte
<script module lang="ts">
  export const defaults = { rules: { value: [] } };
</script>

<List bind:items={node.rules} create={() => ({ target: 'payload', targetType: 'msg', value: '' })}>
  {#snippet row(rule)}
    <TypedInput bind:value={rule.target} bind:type={rule.targetType} types={['msg', 'flow']} />
    <span>=</span>
    <Input bind:value={rule.value} />
  {/snippet}
</List>
```

## A long form: tabs, titles, hints

```svelte
<Tabs tabs={['Request', 'Auth']}>
  {#snippet children(tab)}
    {#if tab === 'Request'}
      <Row label="URL">
        <Input bind:value={node.url} />
        <Hint>Full URL or path of the endpoint</Hint>
      </Row>
      <Separator label="Options" />
      <Row label="Timeout"><Spinner bind:value={node.timeout} /></Row>
    {:else}
      <Row label="Token"><Input type="password" bind:value={node.credentials.token} /></Row>
    {/if}
  {/snippet}
</Tabs>
```

Only the active tab is rendered.

## A script written by the user

```svelte
<Row label="Before request" icon="code">
  <CodeEditor bind:value={node.beforeScript} mode="javascript" height="220px" expand />
  <Hint fullWidth>function(request, msg, node): mutate or return the fields to override.</Hint>
</Row>
```

`expand` adds a button that opens the full screen editor of Node-RED. Run the script with
[`runUserScript`](./runtime#user-scripts).

## Two outputs

When the number of outputs depends on the form, compute it before the node is saved:

```svelte
<script module lang="ts">
  export const defaults = { split: { value: false }, outputs: { value: 1 } };

  export function onsave(values: { split: boolean; outputs: number }) {
    values.outputs = values.split ? 2 : 1;
  }
</script>

<Row label="Split"><Checkbox bind:checked={node.split} text="Success and error outputs" /></Row>
```

## Tell the user a value is wrong

Add a `validate` rule to the property, and the property name to the `Row`: the field is outlined in red as the user
types, and the node is flagged invalid in the flow.

```svelte
<script module lang="ts">
  import { isUrl } from '@keload/node-red-dxp/utils';

  export const defaults = { url: { value: '', validate: (value: string) => !value || isUrl(value) } };
</script>

<Row label="URL" field="url"><Input bind:value={node.url} /></Row>
```

Return a string from `validate` to show it as the error message. More in
[Validating a field](/svelte/node-file#validating-a-field).

## A password or a token

Secrets do not go in `defaults` (they would be exported with the flow). Declare them as credentials:

```svelte
<script module lang="ts">
  export const definition = { credentials: { token: { type: 'password' } } };
</script>

<Row label="Token"><Input type="password" bind:value={node.credentials.token} /></Row>
```

Register the same `credentials` in `controller.ts`: see [Credentials](/svelte/credentials).

## A label for the node on the canvas

```svelte
<script module lang="ts">
  export function label(this: { name: string; url: string }) {
    return this.name || this.url || 'my node';
  }
</script>
```

## When something looks wrong

- A field is empty when the node opens: it is not in `defaults`.
- A value is lost after **Done**: same cause, or a typo in the key.
- The form is blank: open the browser console, a Svelte error is written there.

More in [Troubleshooting](/svelte/troubleshooting).
