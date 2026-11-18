<script lang="ts">
  type Option = string | { value: string; text: string };

  let {
    value = $bindable(),
    options = [],
    empty = false,
    onchange,
  }: { value?: string; options?: Option[]; empty?: boolean; onchange?: () => void } = $props();
</script>

<select bind:value {onchange}>
  {#if empty}<option value="">&nbsp;</option>{/if}
  {#each options as option}
    {@const item = typeof option === 'string' ? { value: option, text: option } : option}
    <option value={item.value}>{item.text}</option>
  {/each}
</select>
