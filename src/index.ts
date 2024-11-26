import type { NodeAPI } from 'node-red';

declare const window: any;

declare global {
  var RED: NodeAPI;
}
