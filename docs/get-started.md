# Get started

<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem">
<img src="./images/esbuild-logo.svg" alt="alt text" width="10%"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="alt text" width="10%"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="alt text" width="10%"/>
</div>

::: warning Under construction 🚧
Documentation is still a work in progress. But the package is fully functional and ready to use.
:::

Start to build your own Node-RED node with `node-red-dxp`! 🚀

::: tip To know before starting
To use this tool, your project needs to follow a simple folder structure. 

This structure is straightforward and designed to help you organize your files efficiently, without adding unnecessary complexity. 

By adhering to this structure, you can take full advantage of the tool's features, ensuring a smooth and streamlined development experience.
:::

## Installation

```bash
npm install node-red-dxp
```

## Usage

Typical project structure:

```plaintext
├── src
│   ├── locales
│   │   ├── en-US.json
│   │   └── fr.json
│   ├── nodes <- Your nodes
│   │   ├── my-node-1
│   │   │   ├── controller.ts
│   │   │   ├── doc.md
│   │   │   ├── editor
│   │   │   │   ├── index.html
│   │   │   │   └── index.ts
│   │   │   ├── node-config.ts
│   │   │   └── types.ts
│   │   ├── ... <- Your other nodes
│   └── red-server.ts <- Use to interact with Node-RED backend
└── tsconfig.json <- Your Typescript configuration
```
