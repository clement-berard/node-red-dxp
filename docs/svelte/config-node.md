# Config node

A config node (broker, server, account... shared by several nodes) is a Svelte node like any other, with
`category: 'config'`.

```
src/nodes/my-server/
├── my-server.svelte
└── controller.ts
```

```svelte
<!-- my-server.svelte -->
<script module lang="ts">
  export const definition = {
    category: 'config',
    color: '#a6bbcf',
    icon: 'font-awesome/fa-server',
    credentials: { token: { type: 'password' } },
  };

  export const defaults = {
    name: { value: '' },
    host: { value: 'localhost', required: true },
    secure: { value: false },
  };

  export function label(this: { name: string; host: string }) {
    return this.name || this.host || 'my-server';
  }
</script>

<script lang="ts">
  import { Checkbox, Input, Row } from '@keload/node-red-dxp/ui';
  let { node } = $props();
</script>

<Row label="Name"><Input bind:value={node.name} /></Row>
<Row label="Host"><Input bind:value={node.host} /></Row>
<Row label="Token"><Input type="password" bind:value={node.credentials.token} /></Row>
<Row label="Secure"><Checkbox bind:checked={node.secure} text="Use TLS" /></Row>
```

```ts
// controller.ts
export const credentials = { token: { type: 'password' } };

export default function (this: any, config: any) {
  RED.nodes.createNode(this, config);
  this.host = config.host;
}
```

## Using it in another node

Declare the property with the **type** of the config node, and bind it with [`ConfigSelect`](./components#configselect):

```svelte
<script module lang="ts">
  export const defaults = { server: { value: '', type: 'my-server', required: true } };
</script>

<Row label="Server"><ConfigSelect bind:value={node.server} type="my-server" property="server" /></Row>
```

```ts
// controller.ts of the other node
const server = RED.nodes.getNode(config.server);
```

The add button of the select opens the form of your config node; the new config node is selected once added.

## Good to know

- `inputs` and `outputs` of `definition` are ignored by Node-RED for a config node.
- `credentials` work as for any node, see [Credentials](./credentials).
