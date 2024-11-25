# DOM Helper

::: info
This documentation is automatically generated from the source code.
:::

## Usage

All functions can be imported from the package like this for example:

```typescript
import { initSelect, watchInput } from '@keload/node-red-dxp/editor/dom-helper';
```

And you benefit from tree-shaking in the final bundle 🚀

## Functions

### addClassesOnSelectors()

> **addClassesOnSelectors**(`selectors`, `classesToAdd`): `void`

#### Parameters

• **selectors**: `string`[]

• **classesToAdd**: `string`[]

#### Returns

`void`

***

### createReactiveField()

> **createReactiveField**\<`T`\>(`selector`, `defaultValue`?): [() => `string`, (`value`) => `void`]

#### Type Parameters

• **T** *extends* `HTMLInputElement` \| `HTMLSelectElement` \| `HTMLTextAreaElement`

#### Parameters

• **selector**: `string`

• **defaultValue?**: `string`

#### Returns

[() => `string`, (`value`) => `void`]

***

### handleAddRemoveClassesOnSelectors()

> **handleAddRemoveClassesOnSelectors**(`action`, `selectors`, `classesToRemove`): `void`

#### Parameters

• **action**: `"add"` \| `"remove"`

• **selectors**: `string`[]

• **classesToRemove**: `string`[]

#### Returns

`void`

***

### initSelect()

> **initSelect**(`selector`, `options`, `params`?): `void`

#### Parameters

• **selector**: `string`

• **options**: `Record`\<`string`, `string`\>[]

• **params?**: `InitSelectParams`

#### Returns

`void`

***

### isNodeInput()

> **isNodeInput**(`selector`): `object`

Checks if a given selector is a node input selector.

#### Parameters

• **selector**: `string`

The selector string to check.

#### Returns

`object`

True if the selector is a node input selector, false otherwise.

##### isFullSelector

> **isFullSelector**: `boolean`

##### isNodeConfigIdShortcut

> **isNodeConfigIdShortcut**: `boolean`

##### isNodeIdShortcut

> **isNodeIdShortcut**: `boolean`

##### value

> **value**: `boolean`

***

### jqSelector()

> **jqSelector**(`selector`): `JQuery`\<`HTMLElement`\>

Resolves a given selector string into a jQuery object based on predefined rules.

#### Parameters

• **selector**: `string`

A string representing the selector.
                  It can include special shortcuts such as `$` or `$$`.

#### Returns

`JQuery`\<`HTMLElement`\>

A jQuery object corresponding to the resolved selector.

#### Examples

```ts
// Resolving a simple selector
jqSelector('#my-element'); // Returns a jQuery object for #my-element
```

```ts
// Using `$` shortcut for node input
jqSelector('$node-name');
// Resolves to: #node-input-node-name
// Returns a jQuery object for the resolved selector
```

```ts
// Using `$$` shortcut for node config input
jqSelector('$$config-name');
// Resolves to: #node-config-input-config-name
// Returns a jQuery object for the resolved selector
```

***

### removeClassesOnSelectors()

> **removeClassesOnSelectors**(`selectors`, `classesToRemove`): `void`

#### Parameters

• **selectors**: `string`[]

• **classesToRemove**: `string`[]

#### Returns

`void`

***

### resolveInputKey()

> **resolveInputKey**(`selector`): `string`

#### Parameters

• **selector**: `string`

#### Returns

`string`

***

### resolveSelector()

> **resolveSelector**(`inSelector`): `string`

Resolves a selector string into a specific format based on predefined rules.

The function supports two shortcuts:
- `$`: Indicates a node input selector, resolved to `#node-input-{name}`.
- `$$`: Indicates a node config input selector, resolved to `#node-config-input-{name}`.

If no shortcuts are detected, the function returns the input selector unchanged.

#### Parameters

• **inSelector**: `string`

A string representing the selector.
                    May contain shortcuts `$` or `$$`.

#### Returns

`string`

The resolved selector as a string.

#### Examples

```ts
// Resolving a plain selector
resolveSelector('#my-element'); // Returns '#my-element'
```

```ts
// Resolving a `$` shortcut
resolveSelector('$node-name'); // Returns '#node-input-node-name'
```

```ts
// Resolving a `$$` shortcut
resolveSelector('$$config-name'); // Returns '#node-config-input-config-name'
```

***

### setInputValue()

> **setInputValue**(`selector`, `val`): `void`

#### Parameters

• **selector**: `string`

• **val**: `string`

#### Returns

`void`

***

### setText()

> **setText**(`selector`, `text`): `void`

#### Parameters

• **selector**: `string`

• **text**: `string`

#### Returns

`void`

***

### watchInput()

> **watchInput**\<`T`\>(`selectors`, `callback`): `void`

#### Type Parameters

• **T** = `any`

#### Parameters

• **selectors**: `string` \| `string`[]

• **callback**

#### Returns

`void`
