import type { NodeAPI } from 'node-red';

// Node-RED injects this at runtime, both server-side (controller code) and
// editor-side (browser bundle). This has to be a real .ts module (not a pure
// .d.ts) and imported for its side effect where used: tsdown's per-entry
// declaration-file generation only resolves types reachable from that entry's
// import graph, not the whole tsconfig project.
declare global {
  var RED: NodeAPI;
}
