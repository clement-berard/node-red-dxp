# Your first node

In ten minutes you will have a package with one node running in a local Node-RED, a form you changed, and a runtime
that uses what the form saves.

## 1. Create the package

```sh
npx @keload/node-red-dxp create
```

The wizard asks for a package name, the editor (**Svelte** is the default), the name of a first node, then installs the
dependencies and runs a first build. Details in [`create`](/cli/create).

```sh
node-red-contrib-my-awesome-lib/
├── src/nodes/my-node/
│   ├── my-node.svelte   # definition + form of the editor
│   ├── controller.ts    # what the node does when a message arrives
│   ├── types.ts         # the properties of the node
│   ├── docs.md          # the help shown in the Node-RED sidebar
│   └── locales/en-US.json
└── package.json
```

## 2. Start Node-RED with live reload

```sh
cd node-red-contrib-my-awesome-lib
pnpm dev
```

`dev` builds your nodes, starts a local Node-RED with them loaded, and reloads the editor each time you save a file.
Open the editor, drag **my-node** from the palette and double-click it: that is the form in `my-node.svelte`.

::: tip No Node-RED installed?
The generated project depends on `node-red` and uses it by default. To use another one (a global install, another
`userDir`...), see the [configuration file](/config-file).
:::

## 3. Read the node file

Open `src/nodes/my-node/my-node.svelte`. It has two parts.

```svelte
<script module lang="ts">
  // 1. What Node-RED needs to know about the node
  import type { SvelteNodeConfig } from '@keload/node-red-dxp/editor/svelte';
  import type { NodeMyNodeProps } from './types';

  export const definition: SvelteNodeConfig<NodeMyNodeProps>['definition'] = {
    category: 'my-awesome-lib',
    color: '#c587b4',
    icon: 'font-awesome/fa-tower-broadcast',
  };

  export const defaults: SvelteNodeConfig<NodeMyNodeProps>['defaults'] = {
    name: { value: '' },
    message: { value: 'hello' },
  };

  export function label(this: NodeMyNodeProps) {
    return this.name || 'my-node';
  }
</script>

<script lang="ts">
  // 2. The form
  import { Input, Row, useT } from '@keload/node-red-dxp/ui';

  let { node }: { node: NodeMyNodeProps } = $props();
  const t = useT(); // translated labels, see locales/en-US.json
</script>

<Row label={t('name')} icon="tag"><Input bind:value={node.name} /></Row>
<Row label={t('message')} icon="comment"><Input bind:value={node.message} /></Row>
```

- `defaults` lists the properties **saved with the node**. A field that is not in `defaults` is lost when you click
  Done.
- `node` is a copy of those properties. `bind:value={node.message}` reads and writes it: nothing reaches the real node
  until **Done**, and **Cancel** throws everything away.

## 4. Add a field

Let the node repeat its message several times. Add the property, and the field:

```svelte
<script module lang="ts">
  export const defaults: SvelteNodeConfig<NodeMyNodeProps>['defaults'] = {
    name: { value: '' },
    message: { value: 'hello' },
    times: { value: '1' }, // new
  };
</script>

<!-- at the end of the form, and add `Spinner` to the import of the ui components -->
<Row label="Times" icon="repeat"><Spinner bind:value={node.times} min={1} max={10} /></Row>
```

Save: the editor reloads, open the node, the field is there.

Then type the property in `types.ts` so the controller knows it:

```ts
export interface NodeMyNodeProps {
  name: string;
  message: string;
  times: string;
}
```

## 5. Use it in the runtime

`controller.ts` runs on the server. `config` holds the properties saved by the form.

```ts
export default function (this: NodeControllerInst<NodeMyNodeProps>, config: NodeControllerConfig<NodeMyNodeProps>) {
  RED.nodes.createNode(this, config);

  this.on('input', async (msg) => {
    // changed: repeat the message `times` times
    this.send({ ...msg, payload: Array(Number(config.times)).fill(config.message).join(' ') });
  });
}
```

Deploy a flow `inject → my-node → debug`, click the inject: the debug panel shows `hello hello` for `times = 2`.

## 6. Write the help

`docs.md` is the help shown in the Node-RED sidebar when the node is selected. Plain Markdown (or `docs.mdx`). Keep the
`### Inputs` / `### Outputs` / `### Details` sections, Node-RED renders them in its own style.

## 7. Build for production

```sh
pnpm build
```

The result is in `dist/`: it is the only folder published. [Test and publish](./test-and-publish) covers the rest.

## Next

- Make the form smarter: [Build the form](./form-recipes).
- Do more in the runtime: [Write the runtime](./runtime).
