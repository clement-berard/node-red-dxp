# `create-node` command

The `create-node` command is used to create a new node in the project.

You can create a regular node or a config node.

## Usage

```bash
Usage: node-red-dxp create-node [options]

Create new node

Options:
  --name <name>   Node name
  --config-node   Generate a config node
  --regular-node  Generate a regular node
  --skip-confirm  Skip confirmations (default: false)
  -h, --help      display help for command
```

### Usage examples

```bash
node-red-dxp create-node --name "my-node-1" --regular-node --skip-confirm
```

_Without parameters, It will ask you some questions to create the node._
```bash
node-red-dxp create-node
```


## Result

```sh
│   │   ├── my-node-1/
│   │   │   ├── controller.ts <- Your node controller (mandatory)
│   │   │   ├── docs.md(x) <- Your node documentation (optional)
│   │   │   ├── editor/ <- Your node editor folder (mandatory)
│   │   │   │   ├── index.html <- Your node editor HTML (mandatory)
│   │   │   │   └── index.ts <- Your node editor script (mandatory)
│   │   │   │   └── styles.scss <- Your node editor styles (optional)
```
