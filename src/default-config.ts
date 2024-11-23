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
