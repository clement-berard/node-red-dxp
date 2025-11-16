# HTML Template

## Overview

You can write your templates with regular HTML, but we recommend de use [pug](pug.md) files, the most powerful way

```sh{5}
├── src/
│   ├── nodes/ # Your nodes
│   │   ├── my-node-1/
│   │   │   ├── editor/ # Your node editor folder
│   │   │   │   └── index.html # Your node editor HTML/Pug (mandatory)
└── package.json
```

You can use HTML or Pug to create your editor template.

::: warning Warning ⚠️
The Pug file is prioritized over the HTML file.
:::

### Example with HTML

:::tabs
== index.html
```html
<div class="dxp-template-form-row">
    <label for="node-input-name">
        <i class="fa fa-tag"></i>
        Name
    </label>
    <div class="content">
        <input type="text" id="node-input-name"/>
    </div>
</div>
<div class="dxp-template-form-row">
    <label for="node-input-entry">
        <i class="fa fa-ellipsis-h"></i>
        Property
    </label>
    <div class="content">
        <input type="text" id="node-input-entry">
        <input type="hidden" id="node-input-entryType">
    </div>
</div>
```
:::

## Available Classes

See [available classes](classes.md)
