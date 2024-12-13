# `create-node` command

The `create-node` command is used to create a new node in the project.

You can create a regular node or a config node.

## Usage

```bash
node-red-dxp create-node
```
It will ask you some questions to create the node and generate the necessary files. Example:

```sh
│   │   ├── my-node-1/
│   │   │   ├── controller.ts <- Your node controller (mandatory)
│   │   │   ├── docs.md(x) <- Your node documentation (optional)
│   │   │   ├── editor/ <- Your node editor folder (mandatory)
│   │   │   │   ├── index.html <- Your node editor HTML (mandatory)
│   │   │   │   └── index.ts <- Your node editor script (mandatory)
│   │   │   │   └── styles.scss <- Your node editor styles (optional)
```
