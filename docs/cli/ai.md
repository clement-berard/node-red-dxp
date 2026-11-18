# `ai` command

Writes the dxp instructions for AI coding agents in `AGENTS.md`, and makes `CLAUDE.md` import it. See
[AI instructions](../ai.md) for what they contain.

```shell
Usage: node-red-dxp ai [options]
```

- `AGENTS.md` is created, or **only the block between `<!-- node-red-dxp:start -->` and `<!-- node-red-dxp:end -->`**
  is replaced: the rest of the file is yours.
- `CLAUDE.md` is created with the line `@AGENTS.md` when missing. An existing `CLAUDE.md` is never edited: the command
  tells you to add the line yourself if it does not import `AGENTS.md`.
- Running it twice changes nothing.
