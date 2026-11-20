<script module lang="ts">
  export type ButtonState = 'idle' | 'loading' | 'success' | 'error';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';

  // Node-RED button with a state: `loading` shows a spinner and blocks the click, `success` and `error` show a colored
  // result. The state is owned by the parent (set it back to `idle` to reset); `disabled` greys the button out
  let {
    state = 'idle',
    disabled = false,
    primary = false,
    icon = '',
    onclick,
    children,
  }: {
    state?: ButtonState;
    disabled?: boolean;
    primary?: boolean;
    icon?: string;
    onclick?: (event: MouseEvent) => void;
    children: Snippet;
  } = $props();

  const stateIcons = { loading: 'spinner fa-spin', success: 'check', error: 'exclamation-triangle' };
  const iconName = $derived(state === 'idle' ? icon : stateIcons[state]);
</script>

<button
  type="button"
  class="dxp-button dxp-button-{state} {primary ? 'dxp-button-primary' : ''}"
  disabled={disabled || state === 'loading'}
  aria-busy={state === 'loading'}
  {onclick}
>
  {#if iconName}<i class="fa fa-{iconName}"></i>{/if}
  {@render children()}
</button>

<!-- only theme variables of Node-RED: the colors follow its light and dark themes -->
<style>
  .dxp-button {
    --dxp-button-color: var(--red-ui-primary-text-color);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border: 1px solid color-mix(in srgb, var(--dxp-button-color) 55%, transparent);
    border-radius: 4px;
    background: color-mix(in srgb, var(--dxp-button-color) 8%, transparent);
    color: var(--dxp-button-color);
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .dxp-button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--dxp-button-color) 18%, transparent);
  }

  .dxp-button:focus-visible {
    outline: 2px solid var(--red-ui-workspace-button-color-focus-outline);
    outline-offset: 2px;
  }

  .dxp-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .dxp-button-loading:disabled {
    cursor: progress;
  }

  .dxp-button-success {
    --dxp-button-color: var(--red-ui-text-color-success);
    border-color: var(--dxp-button-color);
  }

  .dxp-button-error {
    --dxp-button-color: var(--red-ui-text-color-error);
    border-color: var(--dxp-button-color);
  }

  .dxp-button-primary {
    border-color: var(--red-ui-workspace-button-background-primary);
    background: var(--red-ui-workspace-button-background-primary);
    color: var(--red-ui-workspace-button-color-primary);
  }

  .dxp-button-primary:hover:not(:disabled) {
    background: var(--red-ui-workspace-button-background-primary-hover);
  }
</style>
