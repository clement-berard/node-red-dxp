<script lang="ts">
  import { untrack } from 'svelte';

  // Select of a Node-RED config node (broker, server...) with its edit/add button, built by `RED.editor`.
  // `property` is the node property holding the config node id (declared in `defaults` with `type`)
  let {
    value = $bindable(),
    type,
    property,
    filter,
  }: { value?: string; type: string; property: string; filter?: (configNode: any) => boolean } = $props();

  const jq = (globalThis as any).jQuery;
  const red = (globalThis as any).RED;
  let host: HTMLElement;

  $effect(() => {
    // Node-RED swaps the input below for its own select and button, and reads the node property from it
    red.editor.prepareConfigNodeSelect({ [property]: untrack(() => value) }, property, type, 'node-input', filter);
    const select = jq(host).find(`#node-input-${property}`);
    const sync = () => {
      value = select.val();
    };
    sync();
    select.on('change', sync);
    return () => select.off('change', sync);
  });
</script>

<!-- Node-RED sizes its select from the style of the input (70% without) -->
<div bind:this={host} style="width: 100%"><input id="node-input-{property}" type="text" style="width: 100%" /></div>
