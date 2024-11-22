import type { NodeAPI } from 'node-red';

declare const window: any;

declare global {
  var RED: NodeAPI;
}

declare global {
  var SolidJS: typeof import('solid-js');
}

declare global {
  interface Window {
    SolidJS: typeof import('solid-js');
  }
}
