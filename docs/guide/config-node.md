# Config nodes and shared settings

A **config node** holds what several nodes share: a server, an account, an API client. This guide builds one, selects it
from a node, and then lets each node **inherit** the settings of its config node.

## 1. Create a config node

```sh
npx node-red-dxp create-node --name my-server --config-node --yes
```

A config node is a Svelte node like another, with `category: 'config'`.

```svelte
<!-- src/nodes/my-server/my-server.svelte -->
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
// src/nodes/my-server/controller.ts
export const credentials = { token: { type: 'password' } };

export default function (this: any, config: any) {
  RED.nodes.createNode(this, config);
  this.host = config.host;
  this.secure = config.secure;
}
```

## 2. Select it from a node

Declare the property with the **type** of the config node, and show the select with `ConfigSelect`:

```svelte
<script module lang="ts">
  export const defaults = {
    name: { value: '' },
    server: { value: '', type: 'my-server', required: true },
  };
</script>

<Row label="Server"><ConfigSelect bind:value={node.server} type="my-server" property="server" /></Row>
```

The select comes with the edit and the add buttons of Node-RED. In the controller:

```ts
const server = RED.nodes.getNode(config.server);
```

::: warning `type` in `defaults` means "config node"
Use it only for a property that holds the id of a config node. Never to describe the kind of a value.
:::

## 3. Let nodes inherit settings

A request node that talks to your server should not repeat the timeout, the headers or the credentials set on the
server, **unless** it needs to. Give each setting a choice: "Inherit from the server" or its own value.

### In the form

`TypedField` is a whole line for a value and its type. Its `inherit` prop adds a choice **without value**, here
`from_server`:

```svelte
<TypedField
  {node}
  field="timeout"
  label="Timeout"
  valueType="num"
  inherit={{ value: 'from_server', label: 'Inherit from the server' }}
/>
```

Its `defaults` come from `typedFieldDefaults`; a node inherits by default (`type`), the server does not:

```ts
import { typedFieldDefaults } from '@keload/node-red-dxp/editor/svelte';

export const defaults = {
  name: { value: '' },
  server: { value: '', type: 'my-server', required: true },
  ...typedFieldDefaults('timeout', { value: 5000, valueType: 'num', type: 'from_server' }),
};
```

### In the runtime

```ts
const { resolveInherited } = useControllerNode(this, msg);

const { timeout } = await resolveInherited({
  node: config,
  parent: RED.nodes.getNode(config.server),
  inheritType: 'from_server',
  fields: { timeout: 5000 },
});

timeout.value; // the server one if the node inherits, its own otherwise
```

## 4. Write each setting once

With many shared settings, the form and the `defaults` of the server and of the node end up as two copies of the same
list. Describe the settings **once**, in a `.ts` file, and generate both from it.

```ts
// src/common/fields.ts
import { typedFieldDefaults } from '@keload/node-red-dxp/editor/svelte';

export const FIELDS = {
  timeout: { label: 'Timeout', valueType: 'num', value: 5000, inherit: true },
  headers: { label: 'Headers', valueType: 'json', value: '', inherit: false },
} as const;

export function getFieldsDefaults({ forServer = false } = {}) {
  return Object.assign(
    {},
    ...Object.entries(FIELDS).map(([key, field]) =>
      // the server holds a real type, the nodes inherit by default
      typedFieldDefaults(key, {
        value: field.value,
        valueType: field.valueType,
        type: field.inherit && !forServer ? 'from_server' : undefined,
      }),
    ),
  );
}
```

One component renders one setting, for the server or for a node:

```svelte
<!-- src/common/Field.svelte -->
<script lang="ts">
  import { TypedField } from '@keload/node-red-dxp/ui';
  import { FIELDS } from './fields';

  let { node, field, isServer = false } = $props();
  const spec = FIELDS[field];
</script>

<TypedField
  {node}
  {field}
  label={spec.label}
  valueType={spec.valueType}
  inherit={spec.inherit && !isServer ? { value: 'from_server', label: 'Inherit from the server' } : undefined}
/>
```

```svelte
<!-- the server -->
<Field {node} field="timeout" isServer />
<!-- a node -->
<Field {node} field="timeout" />
```

```ts
// defaults of both nodes
export const defaults = { name: { value: '' }, ...getFieldsDefaults({ forServer: true }) };
```

Adding a setting is now one line in `FIELDS`: the form, the defaults and the inheritance follow.

::: tip A real example
[node-red-contrib-happy-http-client](https://github.com/clement-berard/node-red-contrib-happy-http-client) works this
way: `src/common/editor/commonFields.ts` describes the shared settings, `CommonField.svelte` renders them.
:::

## Good to know

- `inputs` and `outputs` of `definition` are ignored for a config node.
- `credentials` work as for any node, see [Credentials](/svelte/credentials).
- A text in a component attribute that contains `{` is read as an expression: `hint="{ a }"` leaves the form empty.
  Write `hint={'{ a }'}`.
- A `defaults` value must be one of the options of its `Select`, otherwise the select is blank on a new node.
