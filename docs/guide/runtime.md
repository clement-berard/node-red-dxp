# Write the runtime

`controller.ts` is the server side of your node: it receives the messages and sends new ones. `config` holds the
properties saved by the form. The helpers below come from `@keload/node-red-dxp/utils/controller`.

```ts
import type { NodeControllerConfig, NodeControllerInst } from '@keload/node-red-dxp/editor';
import { useControllerNode, useNodeStatus } from '@keload/node-red-dxp/utils/controller';

export default function (this: NodeControllerInst<Props>, config: NodeControllerConfig<Props>) {
  RED.nodes.createNode(this, config);
  const status = useNodeStatus(this);

  this.on('input', async (msg) => {
    // ...
  });
}
```

## Typed properties

A property edited with a `TypedInput` is saved as a value and a type (`topic` and `topicType`): `msg` means "read
`msg.<value>`", `flow` means "read the flow variable", `str` is the string itself... `evalProps` resolves them for the
message being processed.

```ts
const { evalProps } = useControllerNode(this, msg);

// topic = "payload", topicType = "msg"  →  msg.payload
const { topic, retries } = await evalProps(config, { topic: undefined, retries: 3 });
```

The second argument lists the properties to evaluate, each with the **default** used when the value is empty
(`undefined` for none). The result has the same keys.

## Inherit from a config node

When a node can take a setting from its config node, `resolveInherited` picks the right value for you.

```ts
const { resolveInherited } = useControllerNode(this, msg);

const { timeout, headers } = await resolveInherited({
  node: config,
  parent: RED.nodes.getNode(config.server),
  inheritType: 'from_server',
  fields: { timeout: 5000, headers: {} },
});

timeout.value; // the server one when config.timeoutType === 'from_server', otherwise the node one
headers.own; // evaluated on the node
headers.parent; // evaluated on the config node: merge them yourself
```

How to offer that choice in the form: [Config nodes and shared settings](./config-node).

## Show what happens: the status

`useNodeStatus` writes the status under the node, with the time of the event.

```ts
const status = useNodeStatus(this);

status.reset();
status.success('Sent'); // green: "Sent at <date and time>"
status.warning('Retrying');
status.error('Invalid URL'); // red
```

Report real errors with `this.error(err, msg)`: they appear in the debug sidebar and can be caught by a `catch` node.

```ts
try {
  // ...
} catch (err: any) {
  this.error(err, msg);
  status.error('Request failed');
  return;
}
```

## Send messages

One output:

```ts
this.send({ ...msg, payload: result });
```

Two outputs (success / error), when `outputs` is `2` (see [Two outputs](./form-recipes#two-outputs)):

```ts
import { splitBooleanOutputs } from '@keload/node-red-dxp/utils/controller';

this.send(splitBooleanOutputs(ok, msg)); // [msg, null] when ok, [null, msg] otherwise
```

## User scripts

Let the user write a script in the form (`CodeEditor`), and run it with the variables you choose:

```ts
import { runUserScript } from '@keload/node-red-dxp/utils/controller';

try {
  const overrides = await runUserScript(config.beforeScript, ['request', 'msg', 'node'], [request, msg, this]);
} catch (err: any) {
  this.error(err, msg);
  return;
}
```

The body can `await` and `return`. There is **no sandbox**, as in a Node-RED function node: tell your users in the
help.

## Credentials

Credentials are read from `this.credentials` and registered by exporting `credentials` next to the controller:

```ts
export const credentials = { token: { type: 'password' } };

// in the controller
const token = this.credentials.token;
```

## Another node of the package

```ts
import { getREDNode } from '@keload/node-red-dxp/utils/controller';

const server = getREDNode<MyServerProps>(config.server); // null when it does not exist
```

## Clean up

Close what you opened (timers, connections) when the node is removed or redeployed:

```ts
this.on('close', (done: () => void) => {
  clearInterval(timer);
  done();
});
```

Next: [test your controller](./test-and-publish#unit-test-the-controller).
