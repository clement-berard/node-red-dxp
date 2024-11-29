# Node Documentation

```plaintext
├── src
│   ├── nodes
│   │   ├── my-node-1
│   │   │   ├── docs.md(x)
```

You can use `md` or `mdx` files to write your documentation.

::: warning
`mdx` files are taken in priority over `md` files.

_If you have both, only the `mdx` file will be taken into account._
:::

Place your documentation in the `src/nodes/my_node/docs.md` or `src/nodes/my_node/docs.mdx` file.

And it will be available in the final HTML file 🎉
