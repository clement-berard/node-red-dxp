<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label = '',
    icon = '',
    class: className = '',
    children,
  }: { label?: string; icon?: string; class?: string; children: Snippet } = $props();
</script>

<div class="dxp-template-form-row {className}">
  <label>
    {#if icon}<i class="fa fa-{icon}"></i>{/if}
    <span title={label}>{label}</span>
  </label>
  <div class="content">{@render children()}</div>
</div>
