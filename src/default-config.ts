export type Config = {
  builder?: {
    outputDir: string;
    esbuildControllerOptions?: {
      includeInBundle?: string[];
    };
    tailwind?: {
      forcedClassesInclusion?: string[];
    };
    editor?: {
      webComponents?: {
        /**
         * @default false
         */
        formRow?: boolean;
      };
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
    tailwind: {
      forcedClassesInclusion: [],
    },
    editor: {
      webComponents: {
        formRow: false,
      },
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
