# Help and i18n

## Help of the node

Unchanged: the help shown in the Node-RED sidebar is `src/nodes/<node>/docs.md` or `docs.mdx`, see
[Node Documentation](../documentation).

## Translations

The locale files are the ones of the [i18n feature](../i18n): `src/locales/<lang>.json` (all nodes) and
`src/nodes/<node>/locales/<lang>.json` (one node). Get the translator in the component script:

```svelte
<script lang="ts">
  import { Row, Input, useT } from '@keload/node-red-dxp/ui';

  let { node } = $props();
  const t = useT();
</script>

<Row label={t('name')}><Input bind:value={node.name} /></Row>
<Row label={t('hint', 'Something to explain')}><Input bind:value={node.hint} /></Row>
```

```json
// locales/en-US.json
{ "name": "Name", "hint": "Something to explain" }
// locales/fr.json
{ "name": "Nom", "hint": "Quelque chose à expliquer" }
```

`t(key, fallback?)`:

- the key is looked up in the locale files of the node, in the language of the editor;
- when it is missing, `fallback` is shown;
- without `fallback`, the key is humanized: `inputData` → `Input data`.

So a node without any locale file still shows readable english labels.

::: tip
`data-i18n` attributes do **not** apply in a Svelte node: the form is rendered after Node-RED translated the template.
Use `t()`.
:::

## Label of the node and outputs

`label` and `outputLabels` run with `this` being the node: use `this._('<node>.<key>')` for translated labels.

```ts
export function label(this: any) {
  return this.name || this._('my-node.label', { defaultValue: 'my node' });
}
```

## Built-in keys

| Key | Where |
|---|---|
| `add` | the add button of `List` (default `Add`) |
