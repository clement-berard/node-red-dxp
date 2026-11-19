<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';

  // Node-RED tabs (`RED.tabs.create`). Only the active tab is rendered: its content mounts when it is shown, so
  // widgets that need a visible container (code editor) lay out correctly
  let {
    tabs,
    active = $bindable(),
    children,
  }: { tabs: string[]; active?: string; children: Snippet<[string]> } = $props();

  const red = (globalThis as any).RED;
  let list: HTMLUListElement;
  // svelte-ignore state_referenced_locally
  let current = $state(active ?? tabs[0]);

  $effect(() => {
    const widget = red.tabs.create({
      element: (globalThis as any).jQuery(list),
      onchange: (tab: { id: string }) => {
        current = tab.id;
        active = tab.id;
      },
    });
    untrack(() => {
      for (const tab of tabs) widget.addTab({ id: tab, label: tab });
      widget.activateTab(current);
    });
  });
</script>

<div><ul bind:this={list}></ul></div>
<div class="mt-4">{@render children(current)}</div>
