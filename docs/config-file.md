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
```

## `builder`

### `outputDir` (string) - Default: `dist`
The directory where the built files will be placed.

### `esbuildControllerOptions` (object) - Default: `{}`

#### `includeInBundle` (string[]) - Default: `[]`
An array of packages to include in the bundle (not "HTML" part, only server-side). 
By default, all packages are excluded and resolved as external.

## `watcher`

### `nodeRed`

#### `enabled` (boolean) - Default: `true`
Enable the hot reload of the Node-RED instance.

#### `path` (string | undefined) - Default: `~/.node-red`
The path to the Node-RED instance. If not specified, the default path is `~/.node-red`.

#### `url` (string) - Default: `http://localhost:1880`
The URL of the Node-RED instance. If not specified, the default URL is `http://localhost:1880`.


