#!/bin/bash

SOURCE="./src/cli/commands/create-node"
DESTINATION="./dist/scaffolding/create-node"

mkdir -p "$DESTINATION"
rsync -a --exclude='__tests__/' --include='*.hbs' --include='*/' --exclude='*' "$SOURCE/" "$DESTINATION/"

cp -r ./src/editor/assets dist/editor

mkdir -p dist/cli/create
cp -r ./src/cli/commands/create/plop-templates dist/cli/create/plop-templates
