<script lang="ts">
  // Node-RED `searchBox` widget (text input with a search icon and a clear button)
  let { value = $bindable(), delay = 300 }: { value?: string; delay?: number } = $props();

  const jq = (globalThis as any).jQuery;
  let input: HTMLInputElement;

  $effect(() => {
    const field = jq(input);
    field.searchBox({ delay });
    const sync = () => {
      value = field.val();
    };
    field.on('change keyup', sync);
    return () => {
      field.off('change keyup', sync);
      field.searchBox('destroy');
    };
  });

  $effect(() => {
    const field = jq(input);
    if (value !== undefined && field.val() !== value) field.val(value);
  });
</script>

<input bind:this={input} type="text" />
