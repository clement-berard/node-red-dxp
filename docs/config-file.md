# Configuration file

You can add a configuration file to your project to specify the settings for the project. 

The configuration file is a JSON file named `.node-red-dxprc.json` and should be placed in the root of the project.

::: tip
You can also use another format like `.node-red-dxprc.js` or `.node-red-dxprc.yaml`.
Behind the scenes, the package uses [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) to load the configuration file.
:::

Here is the type of available values: 

```typescript
export type Config = {
  builder?: {
    /**
     * The directory where the built files will be placed.
     * @default "dist"
     */
    outputDir: string;
    /**
     * @default {}
     */
    esbuildControllerOptions?: {
      /**
       * An array of packages to include in the bundle 
       * (not "HTML" part, only server-side).
       * By default, all packages are excluded and resolved as external.
       * @default []
       */
      includeInBundle?: string[];
    };
    /**
     * @default {}
     */
    tailwind?: {
      /**
       * An array of classes to include in the Tailwind CSS build. 
       * (even if not used in the HTML part)
       * Useful you need to add dynamic classes in your HTML part.
       * @default []
       */
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
      /**
       * Enable the hot reload of the Node-RED instance.
       * @default true
       */
      enabled: boolean;
      /**
       * The path to the Node-RED instance. 
       * If not specified, the default path is `~/.node-red`.
       * @default `~/.node-red`
       */
      path: string | undefined;
      /**
       * The URL of the Node-RED instance. 
       * If not specified, the default URL is `http://localhost:1880`.
       * @default `http://localhost:1880`
       */
      url: string;
    };
  };
};
```
