<script lang="ts">
  import type { Snippet } from 'svelte';

  // Small text under a field. A long text wraps instead of widening the Node-RED tray (sized on the natural width of
  // the form). `state` colors it, `fullWidth` removes the width limit
  let {
    state = '',
    icon = '',
    fullWidth = false,
    children,
  }: { state?: 'info' | 'warning' | 'danger' | 'success' | ''; icon?: string; fullWidth?: boolean; children: Snippet } =
    $props();
</script>

<!-- inline: the css of a component is injected after Node-RED measured the form to size its tray -->
<div style="contain: inline-size" class="hint {state ? `hint-${state}` : ''} {fullWidth ? '' : 'max-w-[350px]'}">
  {#if icon}<i class="fa fa-{icon} mr-1"></i>{/if}
  {@render children()}
</div>
