export const fixedConfig = {
  libCacheDir: '.node-red-dxp',
  srcDir: 'src',
  nodesDirName: 'nodes',
  localesDirName: 'locales',
  globalStylesName: 'styles',
  nodes: {
    controllerName: 'controller',
    editor: {
      dirName: 'editor',
      htmlName: 'index',
      stylesName: 'styles',
      tsName: 'index',
    },
  },
};

export const forcedClasses = [
  'hidden',
  'block',
  'font-bold',
  'red-ui-typedInput-container',
  'red-ui-typedInput-type-select',
  'red-ui-typedInput-type-label',
  'red-ui-typedInput-type-icon',
  // Node-RED itself toggles this on <html> at runtime for dark mode; it can never
  // appear in our own rendered node HTML, so purgecss would otherwise always treat
  // the `html.nr-theme-dark &` override in tailwind.scss as unused and strip it.
  'nr-theme-dark',
];
