# Styling nodes 🎨

<div style="margin-top: 2rem; display: flex; align-items: center; justify-content: center; gap:2rem">
<img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="alt text" width="20%"/>
<img src="https://upload.wikimedia.org/wikipedia/commons/9/96/Sass_Logo_Color.svg" alt="alt text" width="20%"/>
</div>

## Overview

::: info 👌
All custom styles you add, whether global or node-specific, are scoped to the package to ensure they do not interfere with the functionality or appearance of other Node-RED components.
This isolation guarantees seamless integration and avoids unwanted style conflicts.
:::

::: tip ✨
In HTML files, you can directly use [Tailwind](https://tailwindcss.com/)'s utility classes, which will automatically be included in the final styles during the build process.
This ensures a seamless integration of your design while keeping the output optimized.
:::

💡 In addition, you can find some predefined classes [here](template.md).

## Global scope

::: info
All styles in this file are globally available and can be used in any HTML file across all your nodes.
:::

If you want to use custom styles, you can include them in the `src/styles.scss` file.
While it's not mandatory, this is the dedicated location for personal styles in your project.

## Node's scope

::: info
All styles in this section are scoped to the node they are defined in and can only be used in the respective HTML file.
:::

If you want to use custom styles, you can include them in the `src/nodes/<node-name>/editor/styles.scss` file.

## Example

Final styles generated in the `index.html` for production:

```css
.my_package_dashed_name {
    /*global styles*/
    color: #333;
    font-size: 1.5rem;
    
    #my_package_dashed_name_my_node_name {
        /*node-specific styles*/
        background-color: #f0f0f0;
    }
}
```
