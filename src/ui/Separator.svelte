<script lang="ts">
  // A line with an optional title, to split a long form
  let { label = '' }: { label?: string } = $props();
</script>

<div class="flex items-center gap-4 mb-4">
  {#if label}<span class="text-md font-semibold">{label}</span>{/if}
  <div class="flex-1 border-t border-gray-300"></div>
</div>
