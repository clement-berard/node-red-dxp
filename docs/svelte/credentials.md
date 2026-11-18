# Credentials

Node-RED keeps credentials apart from the other properties (they are not exported with the flow). Declare them in
`definition`, register them in the controller, and bind them in `node.credentials`.

```svelte
<script module lang="ts">
  export const definition = {
    category: 'my category',
    credentials: { user: { type: 'text' }, password: { type: 'password' } },
  };
  export const defaults = { name: { value: '' } };
</script>

<script lang="ts">
  import { Input, Row } from '@keload/node-red-dxp/ui';
  let { node } = $props();
</script>

<Row label="User"><Input bind:value={node.credentials.user} /></Row>
<Row label="Password"><Input type="password" bind:value={node.credentials.password} /></Row>
```

```ts
// controller.ts
export const credentials = {
  user: { type: 'text' },
  password: { type: 'password' },
};

export default function (this: any, config: any) {
  RED.nodes.createNode(this, config);
  // this.credentials.user, this.credentials.password
}
```

- A stored password shows as `__PWRD__` in the field and stays **unchanged** unless the user edits it.
- Credentials are saved with the node by **Done**, like the other properties; **Cancel** discards them.
- They do not go in `defaults`.
