<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  import { useT } from './i18n.js';

  // Rows that can be added, removed and (by default) reordered by drag and drop, laid out like the Node-RED lists
  let {
    items = $bindable(),
    create,
    row,
    sortable = true,
  }: { items?: T[]; create: () => T; row: Snippet<[T, number]>; sortable?: boolean } = $props();

  const t = useT();
  let dragging = $state<number | undefined>();

  function move(from: number, to: number) {
    if (!items || from === to) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
  }
</script>

<div class="red-ui-editableList-container">
  {#each items ?? [] as item, index (item)}
    <div
      class="flex items-baseline gap-2 mb-1"
      role="listitem"
      ondragover={(event) => sortable && event.preventDefault()}
      ondrop={() => {
        if (dragging !== undefined) move(dragging, index);
        dragging = undefined;
      }}
    >
      {#if sortable}
        <span
          class="handle cursor-move"
          role="button"
          tabindex="-1"
          draggable="true"
          ondragstart={(event) => {
            dragging = index;
            event.dataTransfer?.setDragImage((event.currentTarget as HTMLElement).parentElement!, 0, 0);
          }}
          ondragend={() => (dragging = undefined)}
        >
          <i class="fa fa-bars"></i>
        </span>
      {/if}
      <div class="flex flex-1 items-baseline gap-2">{@render row(item, index)}</div>
      <button type="button" class="red-ui-button red-ui-button-small" onclick={() => items?.splice(index, 1)}>
        <i class="fa fa-remove"></i>
      </button>
    </div>
  {/each}
  <button type="button" class="red-ui-button" onclick={() => items?.push(create())}>
    <i class="fa fa-plus"></i> {t('add')}
  </button>
</div>
