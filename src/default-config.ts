export type Config = {
  libCacheDir: string;
  srcDir: string;
  nodesDirName: string;
  nodes: {
    controllerName: string;
    localesDirName: string;
    editor: {
      dirName: string;
      htmlName: string;
      tsName: string;
    };
  };
  builder: {
    outputDir: string;
  };
  watcher: {
    nodeRed: {
      enabled: boolean;
      path: string | undefined;
      url: string;
    };
  };
};

export const defaultConfig: Partial<Config> = {
  libCacheDir: '.node-red-dx',
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
  builder: {
    outputDir: 'dist',
  },
  watcher: {
    nodeRed: {
      enabled: true,
      path: '~/.node-red',
      url: 'http://localhost:1880',
    },
  },
};
