<script lang="ts">
  import { setContext } from 'svelte';
  import { TRANSLATE_CONTEXT } from '../../ui/i18n.js';

  // Holds the node properties as one reactive object and hands it to the node component
  let { component: Component, initial, translate } = $props();
  // svelte-ignore state_referenced_locally
  setContext(TRANSLATE_CONTEXT, translate);

  // the form is built once from the saved properties
  // svelte-ignore state_referenced_locally
  let node = $state(initial);

  export function snapshot() {
    return $state.snapshot(node);
  }
</script>

<Component {node} />
