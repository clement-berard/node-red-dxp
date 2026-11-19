<script lang="ts">
  import { untrack } from 'svelte';

  // Node-RED code editor (Monaco), as created by `RED.editor.createEditor`.
  // `mode` is the language (`text`, `json`, `javascript`, `markdown`, `html`...), `options` are passed to Node-RED.
  // `expand` adds a button opening the value in the full screen editor of Node-RED (javascript only)
  let {
    value = $bindable(),
    mode = 'text',
    height = '200px',
    options = {},
    expand = false,
  }: { value?: string; mode?: string; height?: string; options?: Record<string, unknown>; expand?: boolean } =
    $props();

  const red = (globalThis as any).RED;
  const id = `dxp-code-editor-${Math.random().toString(36).slice(2)}`;

  let editor: any;

  function openExpanded() {
    editor.saveView?.();
    red.editor.editJavaScript({
      value: editor.getValue(),
      mode: `ace/mode/${mode}`,
      focus: true,
      cancel: () => {
        editor.restoreView?.();
        editor.focus?.();
      },
      complete: (newValue: string) => {
        editor.setValue(newValue, -1);
        editor.restoreView?.();
        editor.focus?.();
      },
    });
  }

  $effect(() => {
    editor = red.editor.createEditor({
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

<div style="position: relative">
  <div {id} class="node-text-editor" style:height style:min-height="150px"></div>
  {#if expand}
    <button
      type="button"
      class="red-ui-button red-ui-button-small"
      style="position: absolute; right: 0; bottom: calc(100% - 20px); z-index: 10"
      title="Expand editor"
      onclick={openExpanded}
    >
      <i class="fa fa-expand"></i>
    </button>
  {/if}
</div>
