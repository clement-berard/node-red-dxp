# Node-RED server side

```sh{2}
├── src
│   └── red-server.ts # this file
```

## Usage

You can interact with the Node-RED backend using the `src/red-server.ts` file.

For example if you want to add server endpoints, you can do it in this file, by exporting a default function.

```typescript
import { runAnything } from './common/tools/my-custom-helper.ts'


export default function () {

  RED.httpNode.post('/my_endpoint', async (req, res) => {
    // Your code here
    await runAnything();
  });
  
  // another stuff
}
```
::: tip 💡
Feel free to import any package you need in this file. You can structure your code as you want.
:::

## Controller helpers

`@keload/node-red-dxp/utils/controller` holds what most `controller.ts` need (the full list is in the
[API reference](/utils/controller/utils-controller)).

### Evaluate typed properties

A property edited with a `typedInput` is saved as a value and a type (`timeout`, `timeoutType`). `useControllerNode`
evaluates them for the current message:

```ts
const { evalProps, resolveInherited } = useControllerNode(node, msg);

// several properties at once, with the value used when one is empty
const { endpoint, body } = await evalProps(config, { endpoint: '', body: {} });
```

### Inherit from a config node

When a node can take a setting from its config node (see
[config nodes guide](./guide/config-node)), `resolveInherited` gives the right value in one call: the parent one when
`<property>Type` is `inheritType` (and the parent has a value), the node one otherwise.

```ts
const { timeout, retries } = await resolveInherited({
  node: config,
  parent: RED.nodes.getNode(config.server),
  inheritType: 'from_server',
  fields: { timeout: 5000, retries: 3 },
});

timeout.value; // resolved
timeout.own; // evaluated on the node
timeout.parent; // evaluated on the config node (to merge objects, for instance)
```

### Status

`useNodeStatus` writes the status with the time of the event:

```ts
const status = useNodeStatus(node);
status.success('Success'); // green "Success at ..."
status.error('Invalid URL'); // red
status.reset();
```

### User scripts

`runUserScript(body, argNames, argValues)` runs a script written by the user (a [`CodeEditor`](./svelte/components#codeeditor)
field): the body can `await` and `return`; errors reject, so wrap it in a `try/catch` and report with `node.error`.

```ts
const result = await runUserScript(config.script, ['msg', 'node'], [msg, node]);
```
