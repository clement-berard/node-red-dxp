<script lang="ts">
  import type { HTMLInputAttributes } from 'svelte/elements';

  // Always binds a string, whatever the input type: saved values do not change when switching `text` to `number`
  let {
    value = $bindable(),
    type = 'text',
    ...rest
  }: { value?: string } & Omit<HTMLInputAttributes, 'value'> = $props();
</script>

<input {type} value={value ?? ''} oninput={(event) => (value = event.currentTarget.value)} {...rest} />
