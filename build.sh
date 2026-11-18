#!/bin/bash

SOURCE="./src/cli/commands/create-node"
DESTINATION="./dist/scaffolding/create-node"

mkdir -p "$DESTINATION"
rsync -a --exclude='__tests__/' --include='*.hbs' --include='*/' --exclude='*' "$SOURCE/" "$DESTINATION/"

cp -r ./src/editor/assets dist/editor

# svelte sources are compiled by the node package at build time: ship them as is
mkdir -p dist/ui dist/editor/svelte
cp ./src/ui/* dist/ui/
node scripts/emitUiDts.mjs
cp ./src/editor/svelte/Root.svelte dist/editor/svelte/

mkdir -p dist/cli/create
cp -r ./src/cli/commands/create/plop-templates dist/cli/create/plop-templates
