# Resources

The `resources` directory allows you to include static assets (like `.js` and `.css` files). While you can serve these files natively, **`node-red-dxp` goes further by automatically injecting them globally into the final `dist/index.html` build.**

```sh{3}
├── src/
│   ├── nodes/ # Your nodes (mandatory)
└── resources/ # Your resources folder (optional)
└── package.json
```

Any `.js` or `.css` file placed in the `resources` folder will be automatically discovered, wrapped in the appropriate `<script>` or `<link>` tag, and injected into the Node-RED editor environment.

## Adding HTML attributes

If you need to pass specific attributes to the generated `<script>` or `<link>` tags (like `defer`, `type="module"`, or `media="print"`), you can declare them directly in the filename using the `[attrs=...]` syntax.

**Syntax:** `filename[attrs=key1=val1,key2].ext`

### Examples

| Filename in `resources/` | Generated Markup |
| :--- | :--- |
| `my-lib.js` | `<script src="resources/pkg/my-lib.js"></script>` |
| `my-lib[attrs=defer].js` | `<script src="resources/pkg/my-lib.js" defer></script>` |
| `my-lib[attrs=defer,type=module].js` | `<script src="resources/pkg/my-lib.js" defer type="module"></script>` |
| `styles[attrs=media=print].css` | `<link rel="stylesheet" href="resources/pkg/styles.css" media="print">` |

*Note: Boolean attributes (like `defer` or `async`) can be passed without a value. The `[attrs=...]` syntax is automatically stripped out in the final `src` and `href` paths.*

## Using Resources in Node-RED

Thanks to the automatic global injection, any exposed function or style is instantly available across all your nodes' editors.

You can also use these files natively in your HTML files (`src/nodes/{node_name}/editor/index.html`) as described in the [official Node-RED documentation](https://nodered.org/docs/creating-nodes/resources). This is the native behavior of Node-RED.

::: warning ⚠️ Registry Publishing
Ensure your `resources` folder is included in your `package.json` `files` array. Node-RED serves these static assets directly from your package directory.
:::
