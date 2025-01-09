# `watch` command

The `watch` command continuously monitors changes in the `src` directory by default, automatically triggering a rebuild and restarting the local Node-RED server.

If needed, the Node-RED server launch can be disabled via the configuration.

Additionally, it includes BrowserSync integration, which refreshes the browser automatically whenever changes are detected, ensuring a seamless development workflow. 🚀

Refer to the [config file](../config-file.md) for more information.

## Usage

```text
Usage: node-red-dxp watch [options]

watch project

Options:
  --minify    Minify the output (default: false)
  -h, --help  display help for command

```

You can directly run the build command in the terminal, or add it to your `package.json` scripts:

```json
{
  "scripts": {
    "dev": "pnpm node-red-dxp watch"
  }
}
```
