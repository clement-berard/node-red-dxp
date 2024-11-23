export type Config = {
  nodes: {
    editor: {
      htmlName: string;
      tsName: string;
    };
  };
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
  nodes: {
    controllerName: 'controller',
    localesDirName: 'locales',
    editor: {
      dirName: 'editor',
      htmlName: 'index',
      tsName: 'index',
    },
  },
};

export const defaultConfig: Partial<Config> = {
  nodes: {
    editor: {
      htmlName: 'index',
      tsName: 'index',
    },
  },
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
