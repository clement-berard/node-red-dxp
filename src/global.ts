import type { NodeAPI } from 'node-red';

// Node-RED injects this at runtime, both server-side (controller code) and
// editor-side (browser bundle). This has to be a real .ts module (not a pure
// .d.ts) and imported for its side effect where used: tsdown's per-entry
// declaration-file generation only resolves types reachable from that entry's
// import graph, not the whole tsconfig project.
declare global {
  var RED: NodeAPI;

  // Svelte 5 runes, typed here so that a node package does not have to install svelte to use them in `.svelte` files
  function $props<T = any>(): T;
  function $bindable<T = any>(initial?: T): T;
  function $state<T>(initial: T): T;
  function $state<T>(): T | undefined;
  function $derived<T>(expression: T): T;
  // biome-ignore lint/suspicious/noConfusingVoidType: same signature as the `$effect` of svelte
  function $effect(fn: () => void | (() => void)): void;
}
