# Overview

<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem; flex-wrap: wrap;">
  <img src="https://nodered.org/about/resources/media/node-red-icon-2.svg" alt="Node-RED logo" width="50"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" alt="TypeScript logo" width="40"/>
  <img src="./images/esbuild-logo.svg" alt="esbuild logo" width="50"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind CSS logo" width="50"/>
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="Sass logo" width="50"/>
</div>

<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem; flex-wrap: wrap;">
Build Node-RED nodes effortlessly with node-red-dxp 🚀
</div>

**Prerequisites: Project Structure**
To utilize the zero-config features of this tool, your project must adhere to a specific folder structure. This convention allows `node-red-dxp` to streamline the build and bundling process without complex configuration files.

## Bundling Strategy

`node-red-dxp` is primarily a development dependency used for building and bundling. However, it handles production artifacts differently depending on the context:

### 🎨 Editor (Frontend)
* **Format:** IIFE (Immediately Invoked Function Expression).
* **Behavior:** All frontend JavaScript is bundled directly. This ensures all UI utilities are available in the final build with no runtime dependency management required.

### 🖥️ Controller (Backend)
* **Dependencies:** By default, external libraries are treated as **externals** (imported via `require`).
    * *Customization:* You can explicitly configure specific libraries to be included in the bundle (see [configuration documentation](config-file.md)).
* **Core Exception:** The `@keload/node-red-dxp` core library is **always bundled** into the final package and is never treated as an external dependency.
## Usage

Please refer to the following page [Usage](usage.md)
