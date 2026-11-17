# Migration v1 → v2

v1 stays available on the [`v1` branch](https://github.com/clement-berard/node-red-dxp/tree/v1) and under the
`v1` npm dist-tag (`npm i @keload/node-red-dxp@v1`).

## Requirements

- **Node.js `>=22.22`** (declared in `engines`). Some dependencies of v2 no longer support older versions.

## Breaking changes

### Tailwind CSS v4: `important` modifier moves to the end

Tailwind v4 changed the `important` modifier from a prefix to a suffix: `!class` becomes `class!`.
Update every Tailwind class you define yourself (editor HTML, custom classes, toolbar/block styles,
`builder.tailwind.forcedClassesInclusion` in your [configuration file](/config-file)).

```diff
- <div class="!hidden !mt-2">
+ <div class="hidden! mt-2!">
```

This cannot be applied automatically by the library.

### Full-stack utils: `isValidIPv4` and `isValidIPv6` removed

They were deprecated in v1. Use `isValidIP` with the `version` option instead.

```diff
- import { isValidIPv4, isValidIPv6 } from '@keload/node-red-dxp/utils';
+ import { isValidIP } from '@keload/node-red-dxp/utils';

- isValidIPv4('192.168.1.1');
+ isValidIP('192.168.1.1', { version: 4 });

- isValidIPv6('1234::abcd');
+ isValidIP('1234::abcd', { version: 6 });
```

### Programmatic builder API: `Builder` class replaced by `build()`

Only relevant if you import `@keload/node-red-dxp/builder` yourself. The `Builder` class and its
`buildAll()` method are gone; the builder is now made of plain functions.

```diff
- import { Builder } from '@keload/node-red-dxp/builder';
- await new Builder({ minify: true }).buildAll();
+ import { build } from '@keload/node-red-dxp/builder';
+ await build({ minify: true });
```

The CLI (`node-red-dxp build`, `watch`, ...) is unchanged.
