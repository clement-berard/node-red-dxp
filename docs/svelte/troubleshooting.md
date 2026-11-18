# Troubleshooting

## The `typedInput` looks broken (a gap and an arrow)

The type of the node is not in the `types` you gave. Node-RED then keeps an unknown type and breaks the layout.
`TypedInput` already falls back to the first allowed type: if you still see it, check that `types` is an **array of
strings** (`types={['msg', 'json']}`, not `types="json"` or `types={['msg,json']}`).

## A field is empty when the node is opened

- The property is not in `defaults`: only the declared properties are loaded and saved.
- For a nested value (`node.opts.delay`), the parent object must exist: declare it (`opts: { value: {} }`).

## A value is lost after **Done**

Same cause: a key that is not in `defaults` is dropped. Check the spelling too (`node.dalay` creates a new key).

## A config node select is empty or not saved

`ConfigSelect` needs its property declared in `defaults` with the `type` of the config node, and the `property` prop
equal to that name.

## My `id`s are ignored / Node-RED overwrites my field

Do not give `node-input-<property>` ids to your fields: Node-RED reads them itself on save. Use `bind:` only.

## A Tailwind class has no effect

It is built at runtime (string concatenation) and cannot be found by the scan, see [Styling](./styling).

## `$` is an illegal variable name

Svelte reserves `$` for runes. Reach jQuery with `globalThis.jQuery` (the components of dxp do):

```ts
const jq = (globalThis as any).jQuery;
```

## `RED` or the runes are not found by the IDE

Add `@keload/node-red-dxp` to the `types` of your `tsconfig.json`, see [TypeScript and IDE](./typescript).

## The bundle is bigger than before

The Svelte runtime is part of the editor script (about 70 KB minified, once for all the nodes of the package). Packages
that need the smallest editor can keep classic nodes.
