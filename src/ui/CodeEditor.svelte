<script lang="ts">
  import { untrack } from 'svelte';

  // Node-RED code editor (Monaco), as created by `RED.editor.createEditor`.
  // `mode` is the language (`text`, `json`, `javascript`, `markdown`, `html`...), `options` are passed to Node-RED
  let {
    value = $bindable(),
    mode = 'text',
    height = '200px',
    options = {},
  }: { value?: string; mode?: string; height?: string; options?: Record<string, unknown> } = $props();

  const red = (globalThis as any).RED;
  const id = `dxp-code-editor-${Math.random().toString(36).slice(2)}`;

  $effect(() => {
    const editor = red.editor.createEditor({
      ...untrack(() => options),
      id,
      mode: `ace/mode/${mode}`,
      value: untrack(() => value) ?? '',
    });
    const sync = () => {
      value = editor.getValue();
    };
    editor.getSession().on('change', sync);
    return () => editor.destroy();
  });
</script>

<div {id} class="node-text-editor" style:height style:min-height="150px"></div>
