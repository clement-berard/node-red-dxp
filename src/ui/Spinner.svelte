<script lang="ts">
  // Node-RED / jQuery UI `spinner` (number input with arrows). Always binds a string, like `Input`
  let {
    value = $bindable(),
    min,
    max,
    step,
  }: { value?: string; min?: number; max?: number; step?: number } = $props();

  const jq = (globalThis as any).jQuery;
  let input: HTMLInputElement;

  $effect(() => {
    const field = jq(input);
    const spinnerOptions: Record<string, number> = {};
    if (min !== undefined) spinnerOptions.min = min;
    if (max !== undefined) spinnerOptions.max = max;
    if (step !== undefined) spinnerOptions.step = step;
    field.spinner(spinnerOptions);
    const sync = () => {
      value = field.val();
    };
    field.on('change spinstop', sync);
    return () => {
      field.off('change spinstop', sync);
      field.spinner('destroy');
    };
  });

  $effect(() => {
    const field = jq(input);
    if (value !== undefined && field.val() !== value) field.val(value);
  });
</script>

<input bind:this={input} type="text" />
