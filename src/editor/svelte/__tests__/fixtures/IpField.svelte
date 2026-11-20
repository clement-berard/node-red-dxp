<script lang="ts">
  let { node } = $props();
</script>

<input value={node.ip} oninput={(event) => (node.ip = event.currentTarget.value)} />
