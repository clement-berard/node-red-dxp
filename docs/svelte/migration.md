# Migrate from pug

A classic node (`editor/index.ts` + `editor/index.pug`) and a Svelte node can live in the same package: migrate node by
node.

## Steps

1. Create `src/nodes/<node>/<node>.svelte`.
2. Move the content of `index.ts` into the `<script module>` (`defaults`, `definition`, `label`...).
3. Rewrite the pug as markup, one component per row.
4. Replace the show/hide logic by `{#if}`.
5. Delete the `editor/` folder (`controller.ts` and `docs.mdx` stay).

## Equivalents

| Classic | Svelte |
|---|---|
| `category`, `color`, `icon`, `paletteLabel`, `inputs`, `outputs` | `export const definition = {...}` |
| `defaults` | `export const defaults = {...}` |
| `label`, `outputLabels` | `export function label(this)`, `outputLabels(this, index)` |
| `oneditsave` | `export function onsave(values)` |
| `oneditprepare` | the component itself |
| `+dxpFormRowInputText` | `<Row label="..."><Input bind:value={node.x} /></Row>` |
| `+dxpFormRowCheckbox` | `<Row label="..."><Checkbox bind:checked={node.x} /></Row>` |
| `+dxpFormRowSelect` + `initSelect` | `<Select bind:value={node.x} options={[...]} />` |
| `applyTypedInput` + hidden `xType` input | `<TypedInput bind:value={node.x} bind:type={node.xType} />` |
| `+dxpFormRowEditableList` + `initEditableList` | `<List bind:items={node.x} create={...}>{#snippet row(item)}...{/snippet}</List>` |
| `getFormValues('group')` / `setFormValues` | `bind:value={node.group.field}` |
| `.extra-field` + `revealClasses` + `handleShowDivs` | `{#if ...}` |
| `watchInput(['$a'], ...)` | `$derived` / `onchange` |
| `data-i18n` | `t('key')` |
| `docs.md(x)` | unchanged |

## Example

```pug
+dxpFormRowInputText({ id: 'name', label: 'Name', icon: 'tag' })
+dxpFormRowSelect({ id: 'mode', label: 'Mode' })
.extra-field.my-node_advanced
    +dxpFormRowInputText({ id: 'delay', label: 'Delay' })
```

```ts
oneditprepare() {
  initSelect('$mode', [{ value: 'simple', text: 'simple' }, { value: 'advanced', text: 'advanced' }]);
  watchInput(['$mode'], ([mode]) => jqSelector('.my-node_advanced').toggleClass('hidden!', mode !== 'advanced'));
}
```

becomes:

```svelte
<Row label="Name" icon="tag"><Input bind:value={node.name} /></Row>
<Row label="Mode"><Select bind:value={node.mode} options={['simple', 'advanced']} /></Row>
{#if node.mode === 'advanced'}
  <Row label="Delay"><Input bind:value={node.delay} /></Row>
{/if}
```

## Compatibility of saved nodes

Property names and values are the same, so existing nodes keep working. Keep a property flat or nested exactly as it was
saved: the classic `getFormValues('tools')` saves `{ 'cyclicCounter-maxCount': '5' }`, so bind
`node.tools['cyclicCounter-maxCount']`.
