<script module lang="ts">
  import type { SvelteNodeConfig } from '@keload/node-red-dxp/editor/svelte';
  import type { Node{{pascalName}}Props } from './types';

  export const definition: SvelteNodeConfig<Node{{pascalName}}Props>['definition'] = {
    category: '{{category}}',
    color: '{{color}}',
    icon: 'font-awesome/fa-tower-broadcast',
  };

  export const defaults: SvelteNodeConfig<Node{{pascalName}}Props>['defaults'] = {
    name: { value: '' },
    message: { value: 'hello' },
  };

  export function label(this: Node{{pascalName}}Props) {
    return this.name || '{{dashName}}';
  }
</script>

<script lang="ts">
  import { Input, Row, useT } from '@keload/node-red-dxp/ui';

  let { node }: { node: Node{{pascalName}}Props } = $props();

  const t = useT();
</script>

<Row label={t('name')} icon="tag"><Input bind:value={node.name} /></Row>
<Row label={t('message')} icon="comment"><Input bind:value={node.message} /></Row>
