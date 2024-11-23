export type Config = {
  builder: {
    outputDir: string;
    esbuildControllerOptions?: {
      includeInBundle?: string[];
    };
  };
  watcher: {
    nodeRed: {
      enabled: boolean;
      path: string | undefined;
      url: string;
    };
  };
};

export const fixedConfig = {
  libCacheDir: '.node-red-dxp',
  srcDir: 'src',
  nodesDirName: 'nodes',
  localesDirName: 'locales',
  nodes: {
    controllerName: 'controller',
    editor: {
      dirName: 'editor',
      htmlName: 'index',
      tsName: 'index',
    },
  },
};

export const defaultConfig: Partial<Config> = {
  builder: {
    outputDir: 'dist',
    esbuildControllerOptions: {
      includeInBundle: [],
    },
  },
  watcher: {
    nodeRed: {
      enabled: true,
      path: '~/.node-red',
      url: 'http://localhost:1880',
    },
  },
};
