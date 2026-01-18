# Configuration file

You can add a configuration file to your project to specify the settings for the project. 

The configuration file is a JSON file named `.node-red-dxprc.json` and should be placed in the root of the project.

```sh{2}
├── src/
├── .node-red-dxprc.{json,yaml}
└── package.json
```

::: tip
You can also use another format like `.node-red-dxprc.js` or `.node-red-dxprc.yaml`.
Behind the scenes, the package uses [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) to load the configuration file.
:::

Here is the type of available values: 

<!--@include: ./generated-config.md-->
