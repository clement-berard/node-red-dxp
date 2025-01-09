# `build` command

The build script compiles all nodes into a production-ready, optimized format at lightning speed, 
with the output defaulting to the `dist` directory. (you can edit this in the [config file](../config-file.md) file)

## Usage

```text
Usage: node-red-dxp build [options]

The build script compiles all nodes into a production-ready, optimized format at lightning speed, with the output defaulting to the dist directory.

Options:
  --no-minify  No minify the output
  -h, --help   display help for command
```

You can directly run the build command in the terminal, or add it to your `package.json` scripts:

```json
{
  "scripts": {
    "build": "pnpm node-red-dxp build"
  }
}
```

::: tip 🚀 Minification
The build process minifies the output by default, ensuring optimized, production-ready JavaScript (with tree-shaking) for the editor and controller, as well as cleaned and minified CSS for the most efficient code.
Use the `--no-minify` option if you want to disable minification. 🚀
:::
