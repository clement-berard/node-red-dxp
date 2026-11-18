<script module lang="ts">
  import type { SvelteNodeConfig } from '@keload/node-red-dxp/editor/svelte';
  import type { Node{{pascalName}}Props } from './types';

  export const definition: SvelteNodeConfig<Node{{pascalName}}Props>['definition'] = {
    category: 'config',
    color: '#a6bbcf',
    icon: 'font-awesome/fa-server',
    credentials: { user: { type: 'text' }, password: { type: 'password' } },
  };

  export const defaults: SvelteNodeConfig<Node{{pascalName}}Props>['defaults'] = {
    name: { value: '' },
    host: { value: 'localhost', required: true },
  };

  export function label(this: Node{{pascalName}}Props) {
    return this.name || this.host || '{{dashName}}';
  }
</script>

<script lang="ts">
  import { Input, Row, useT } from '@keload/node-red-dxp/ui';

  let { node }: { node: Node{{pascalName}}Props & { credentials: { user: string; password: string } } } = $props();

  const t = useT();
</script>

<Row label={t('name')} icon="tag"><Input bind:value={node.name} /></Row>
<Row label={t('host')} icon="server"><Input bind:value={node.host} /></Row>
<Row label={t('user')} icon="user"><Input bind:value={node.credentials.user} /></Row>
<Row label={t('password')} icon="key"><Input type="password" bind:value={node.credentials.password} /></Row>
