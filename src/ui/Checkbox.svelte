<script lang="ts">
  let { checked = $bindable(), text = '' }: { checked?: boolean; text?: string } = $props();
</script>

<div class="checkbox">
  <input type="checkbox" bind:checked />
  {#if text}<span class="italic">{text}</span>{/if}
</div>
