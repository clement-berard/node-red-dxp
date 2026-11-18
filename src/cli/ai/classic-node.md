# Classic node (`src/nodes/<node>/editor/`)

```
src/nodes/<node>/
├── controller.ts
├── editor/
│   ├── index.html | index.pug   form (pug wins over html when both exist)
│   ├── index.ts                 definition: createEditorNode(...)
│   └── styles.scss              optional, scoped to this node
```

## `editor/index.ts`

```ts
import { createEditorNode, type NodeEditorProps } from '@keload/node-red-dxp/editor';
import { watchInput } from '@keload/node-red-dxp/editor/dom-helper';
import type { NodeMyNodeProps } from '../types';

const MyNode = createEditorNode<NodeEditorProps<NodeMyNodeProps>>({
  category: 'my category', color: '#a6bbcf', icon: 'font-awesome/fa-wrench',
  inputs: 1, outputs: 1,
  defaults: { name: { value: '' }, mode: { value: 'simple' } },
  label: function () { return this.name || 'my node'; },
  oneditprepare: () => { watchInput('$mode', ([mode]) => { /* react to the field */ }); },
});
export default MyNode;
```

## Form

Node-RED binds inputs by id: `node-input-<property>` (config nodes: `node-config-input-<property>`). Use the helper
classes of dxp:

```html
<div class="dxp-template-form-row">
  <label for="node-input-name"><i class="fa fa-tag"></i> Name</label>
  <div class="content"><input type="text" id="node-input-name"/></div>
</div>
```

Also `.alert .alert-info|warning|danger|success`, `.hint .hint-info|warning|danger|success`, `.hidden`.
Pug mixins: `dxpFormRowInputText`, `dxpFormRowCheckbox`, `dxpFormRowSelect`, `dxpFormRowEditableList`,
`dxpFormRowSelectConfigNode`, `dxpFormTitleSeparator`, `dxpHint`, `dxpTabs`.

## DOM helpers (`@keload/node-red-dxp/editor/dom-helper`, tree-shaken)

`$prop` is shorthand for `#node-input-prop`. `watchInput(['$a','$b'], ([a, b]) => ...)`, `initSelect('$x', options)`,
`applyTypedInput`, `initEditableList`, `getEditableListItems`, `getFormValues(prefix)` / `setFormValues(prefix, values)`,
`jqSelector`, `addClassesOnSelectors` / `removeClassesOnSelectors`, `setText`, `setInputValue`, `isCheckboxChecked`,
`initTabs`.

## Notes

- Translations: `data-i18n` works in the template; keys come from `locales/<lang>.json` files.
- Help: `docs.md(x)`.
- For a new node, prefer Svelte (`svelte-node.md`); convert an existing one with `migrate-to-svelte.md`.
