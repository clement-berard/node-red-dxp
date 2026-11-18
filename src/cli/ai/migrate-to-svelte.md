# Migrate a classic node to Svelte

A classic node (`editor/index.ts` + `editor/index.{pug,html}`) and a Svelte node can live in the same package: migrate
**one node at a time**, build and test after each.

## Playbook

1. Read `editor/index.ts` (definition, `oneditprepare`, `oneditsave`, `label`) and the pug/html form.
2. Create `src/nodes/<node>/<node>.svelte` (see `svelte-node.md`).
3. Module script: move `category`, `color`, `icon`, `inputs`, `outputs`, `paletteLabel`, `credentials` into
   `export const definition`; `defaults` into `export const defaults` (same keys, same options);
   `label`/`outputLabels` as `export function`; `oneditsave` logic into `export function onsave(values)`.
4. Markup: one component per form row, bound on `node.<property>`.
5. `oneditprepare` logic: delete, replaced by reactivity (`$derived`, `{#if}`, `onchange`).
6. Move labels into `locales/<lang>.json` and use `t('key')` (replaces `data-i18n`).
7. Delete the `editor/` folder (`controller.ts`, `docs.md(x)`, `locales/`, `types.ts` stay). If `editor/styles.scss`
   held styles, port them to Tailwind classes or `<style>` in the `.svelte`.
8. `build`, then check in Node-RED: open a node saved with the old version (values must show), edit, Done, reopen.

## Equivalents

| Classic | Svelte |
|---|---|
| `createEditorNode({ category, color, icon, inputs, outputs })` | `export const definition = {...}` |
| `defaults` | `export const defaults = {...}` |
| `label`, `outputLabels` | `export function label(this)`, `outputLabels(this, index)` |
| `oneditsave` | `export function onsave(values)` |
| `oneditprepare` | the component itself |
| `+dxpFormRowInputText` / `<input type=text>` | `<Row label=".."><Input bind:value={node.x} /></Row>` |
| checkbox | `<Checkbox bind:checked={node.x} text=".." />` |
| `<select>` + `initSelect` | `<Select bind:value={node.x} options={[...]} />` |
| `applyTypedInput` + hidden `xType` input | `<TypedInput bind:value={node.x} bind:type={node.xType} types={[...]} />` |
| editable list + `initEditableList` | `<List bind:items={node.x} create={...}>{#snippet row(item)}...{/snippet}</List>` |
| `getFormValues('group')` / `setFormValues` | `bind:value={node.group.field}` |
| `.extra-field` + `.hidden` toggles, `revealClasses` | `{#if ...}` |
| `watchInput(['$a'], ...)` | `$derived`, or `onchange` on the component |
| config node select | `<ConfigSelect bind:value={node.x} type="..." property="x" />` |
| `data-i18n` | `t('key')` |

## Keep saved nodes working

Property names and values must not change. Keep each property flat or nested **exactly** as it was saved (the classic
`getFormValues('tools')` saves `{ 'cyclicCounter-maxCount': '5' }`: bind `node.tools['cyclicCounter-maxCount']`).
A property can be missing on old nodes: give it a sensible `defaults` value. New `defaults` keys must not be `required`
if old nodes would then be flagged invalid.

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
becomes
```svelte
<Row label="Name" icon="tag"><Input bind:value={node.name} /></Row>
<Row label="Mode"><Select bind:value={node.mode} options={['simple', 'advanced']} /></Row>
{#if node.mode === 'advanced'}
  <Row label="Delay"><Input bind:value={node.delay} /></Row>
{/if}
```
