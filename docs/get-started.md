# Get started

<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem">
<img src="https://nodered.org/about/resources/media/node-red-icon-2.svg" alt="alt text" width="10%"/>
</div>
<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem">
<img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="alt text" width="10%"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="alt text" width="10%"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="alt text" width="10%"/>
<img src="./images/esbuild-logo.svg" alt="alt text" width="10%"/>
</div>

Start building your own Node-RED node effortlessly with `node-red-dxp`! 🚀 

<div style="font-weight:bold;margin: 1rem 0 1rem 0; display: flex; align-items: center; justify-content: center; gap:2rem">
✨ It's quick, simple, and hassle-free! ✨
</div>

::: tip 😎 To know before starting
To use this tool, your project needs to follow a simple folder structure. 

This structure is straightforward and designed to help you organize your files efficiently, without adding unnecessary complexity. 

By adhering to this structure, you can take full advantage of the tool's features, ensuring a smooth and streamlined development experience.
:::

## Installation

```sh
npm install @keload/node-red-dxp --dev // [!=npm auto]
```

This package is primarily designed to be used during development, 
providing tools to assist with building and bundling. It is not required in production by default.

While the package is mostly used for development, some utility functions are intended for inclusion in the final production bundle:

🎨 **Editor (Frontend):**

- All JavaScript for the editor is bundled in the `iife` format. This ensures that necessary utilities are always included in the editor's final bundle without requiring additional configuration.

🖥️ **Controller (Backend):**
- By default, all external libraries used in the controller are treated as external dependencies and are imported via require. However, you can configure which libraries should be included in the bundle explicitly. Refer to the configuration documentation [here](config-file.md#includeinbundle-string-default).
- Note: The core library `@keload/node-red-dxp` is always bundled in the final package and is never referenced as an external dependency.

## Usage

Please refer to the following page [Usage](usage.md)
