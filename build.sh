#!/bin/bash

SOURCE="./src/scaffolding"
DESTINATION="./dist/scaffolding"

mkdir -p "$DESTINATION"
rsync -a --include='*.hbs' --include='*/' --exclude='*' "$SOURCE/" "$DESTINATION/"

cp -r ./src/editor/assets dist/editor
