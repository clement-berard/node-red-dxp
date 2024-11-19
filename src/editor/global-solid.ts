import * as Solid from 'solid-js';

declare global {
  var SolidJS: typeof import('solid-js');
}

declare global {
  interface Window {
    SolidJS: typeof import('solid-js');
  }
}

if (!window.SolidJS) {
  window.SolidJS = Solid;
}
