<script lang="ts">
  import type { Snippet } from 'svelte';
  import { useValidation } from './validation.js';

  // `field` is the property shown by the row: when it breaks its rule in `defaults` (`required`, `validate`), the row
  // is outlined in red and the message of the validator, if any, is shown under it
  let {
    label = '',
    icon = '',
    field = '',
    class: className = '',
    children,
  }: { label?: string; icon?: string; field?: string; class?: string; children: Snippet } = $props();

  const valid = useValidation();
  const result = $derived(field ? valid(field) : true);
</script>

<div class="dxp-template-form-row {className}" class:dxp-invalid={result !== true}>
  <label>
    {#if icon}<i class="fa fa-{icon}"></i>{/if}
    <span title={label}>{label}</span>
  </label>
  <div class="content">
    {@render children()}
    {#if typeof result === 'string'}<div class="hint hint-danger">{result}</div>{/if}
  </div>
</div>
