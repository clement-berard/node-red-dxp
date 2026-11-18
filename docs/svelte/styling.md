# Styling

Svelte nodes use the same styles as the other nodes of dxp: [Tailwind](../editor/styles) utilities and the
[available classes](../editor/templating/classes) (`.dxp-template-form-row`, `.alert`...). They are scoped under
the class of your package, so nothing leaks to the rest of Node-RED.

## Tailwind classes

Write them in the markup, as usual:

```svelte
<div class="alert alert-info text-center">Careful</div>
<div class="flex items-baseline gap-2">...</div>
```

dxp scans the `.svelte` files of the node folder (and of its sub-folders) and the components of
`@keload/node-red-dxp/ui`, and only generates the classes they use.

::: warning
A class built at runtime (`class={'text-' + color}`) cannot be found by the scan. Write the full class names:
`class={isOk ? 'text-green-600' : 'text-red-600'}`.
:::

## `<style>` blocks

Allowed: the CSS of a component is compiled and injected with the editor script (no extra file).

```svelte
<style>
  .my-row { margin-bottom: 0.5rem; }
</style>
```

## Dark mode

Node-RED puts `nr-theme-dark` on `<html>`: style it like the other nodes
(`html.nr-theme-dark & { ... }`), or use the CSS variables of Node-RED (`var(--red-ui-form-input-border-color)`...).

## Global styles

`src/styles.scss` and `src/nodes/<node>/editor/styles.scss` still work, see [Styling nodes](../editor/styles).
