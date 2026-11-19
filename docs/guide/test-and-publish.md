# Test and publish

## Check the editor

`pnpm dev` is the loop: save, the editor reloads, try. For every change of a form, check in Node-RED:

1. Open a **new** node: defaults are right.
2. Open a node saved **before** your change: its values are still there.
3. Edit, **Done**, reopen: values kept.
4. Edit, **Cancel**: nothing changed.

Never rename a key of `defaults`: nodes already in flows would lose that value. Add a new key instead, and give it a
default.

## Unit test the controller

The generated project comes with [Vitest](https://vitest.dev). A controller is a function called with a fake node: no
Node-RED needed. Put the tests next to the file, in `__tests__/`:

```ts
// src/nodes/my-node/__tests__/controller.test.ts
import { describe, expect, it, vi } from 'vitest';
import controller from '../controller';

function setup(config: Record<string, unknown>) {
  let onInput: (msg: object) => Promise<void> = async () => {};
  const node = {
    send: vi.fn(),
    status: vi.fn(),
    error: vi.fn(),
    on: vi.fn((event: string, handler: typeof onInput) => {
      if (event === 'input') onInput = handler;
    }),
  };

  // the controller reads the global `RED`
  (globalThis as any).RED = { nodes: { createNode: vi.fn() } };
  (controller as any).call(node, config);

  return { node, input: (msg: object = {}) => onInput(msg) };
}

describe('my-node', () => {
  it('should repeat the message', async () => {
    const { node, input } = setup({ message: 'hello', times: '2' });

    await input({ topic: 't' });

    expect(node.send).toHaveBeenCalledWith({ topic: 't', payload: 'hello hello' });
  });
});
```

When the controller evaluates typed properties, give `RED.util.evaluateNodeProperty` the behaviour you need:

```ts
(globalThis as any).RED = {
  nodes: { createNode: vi.fn() },
  util: {
    // value, type, node, msg, callback
    evaluateNodeProperty: (value: string, type: string, _node: unknown, msg: any, done: Function) =>
      done(null, type === 'msg' ? msg[value] : value),
  },
};
```

Move the logic that does not need `this` or `RED` (resolving a URL, merging options...) into plain functions: they are
the easiest to test.

```sh
pnpm test                    # run once
pnpm vitest --watch          # re-run on save
pnpm vitest run --coverage   # coverage (add @vitest/coverage-v8)
```

## Type check and lint

```sh
pnpm typecheck
pnpm lint
```

`tsc` checks the `.ts` files only: the content of a `.svelte` file is not type-checked. Put logic you want checked in
a `.ts` file. See [TypeScript and IDE](/svelte/typescript).

## Build

```sh
pnpm build
```

The result is in `dist/`. The editor and the controller are bundled, the editor is minified (use `--no-minify` to
debug), the help and the translations are included. See [`build`](/cli/build).

## Publish

Before the first release, check `package.json`:

```json
{
  "name": "@me/node-red-contrib-my-lib",
  "files": ["dist"],
  "keywords": ["node-red", "node-red-contrib"],
  "node-red": { "version": ">=2.0.0", "nodes": { "all": "dist/index.js" } }
}
```

- `files: ["dist"]` publishes the build only.
- The `node-red` keyword and the `node-red` section make the package appear in the Node-RED
  [flow library](https://flows.nodered.org) and installable from the palette manager.
- Add `resources` to `files` if your package has a [`resources`](/resources) folder.

Then:

```sh
pnpm build
npm publish --access public   # scoped packages
```

To list it in the flow library, add it on https://flows.nodered.org/add/node once published.
