# TypeScript and IDE

## Types in the component

```svelte
<script lang="ts">
  import type { MyNodeProps } from './types';

  let { node }: { node: MyNodeProps } = $props();
</script>
```

`$props`, `$state`, `$derived`, `$effect` and `$bindable` are typed by dxp, the same way as `RED`. Add dxp to the
`types` of your `tsconfig.json` (as for any dxp package):

```json
{ "compilerOptions": { "types": ["node-red", "@keload/node-red-dxp"] } }
```

## Typing the exports

Type the module exports with `SvelteNodeConfig`:

```ts
import type { SvelteNodeConfig } from '@keload/node-red-dxp/editor/svelte';

export const defaults: SvelteNodeConfig<MyNodeProps>['defaults'] = { name: { value: '' } };
```

## What is checked

- `tsc` only checks `.ts` files: the content of a `.svelte` file is **not** type-checked by `pnpm typecheck`.
- Put logic in a `.ts` file and import it when you want it checked.
- The components of `@keload/node-red-dxp/ui` are published with their `.svelte.d.ts` types.

## Known limitations

- `svelte-check` (the CLI that checks `.svelte` files) refuses TypeScript 7 unless TypeScript 6 is installed next to it.
- Prop autocompletion of the `ui` components can be missing in WebStorm (tracked, not fixed yet). The props are listed in
  [Components](./components).
