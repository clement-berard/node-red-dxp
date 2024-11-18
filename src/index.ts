import type { NodeAPI } from 'node-red';

declare global {
  var RED: NodeAPI;
}

export const _RED = typeof global !== 'undefined' ? global.RED : window.RED;
