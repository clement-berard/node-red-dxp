#!/bin/bash

SOURCE="./src/scaffolding"
DESTINATION="./dist/scaffolding"

mkdir -p "$DESTINATION"
rsync -a --include='*.hbs' --include='*/' --exclude='*' "$SOURCE/" "$DESTINATION/"

cp -r ./src/editor/assets dist/editor
cp -r ./src/editor/global-solid.ts dist/editor
cp -r ./src/editor/web-components/dxpFormRow.ts dist/editor
