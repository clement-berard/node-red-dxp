#!/bin/bash

# CLI assets: templates of `create` / `create-node` and the guides for AI agents
rm -rf dist/templates dist/ai
mkdir -p dist/templates dist/ai
cp -r ./src/cli/templates/. dist/templates/
cp ./src/cli/ai/*.md dist/ai/

cp -r ./src/editor/assets dist/editor

# svelte sources are compiled by the node package at build time: ship them as is
mkdir -p dist/ui dist/editor/svelte
cp ./src/ui/*.svelte ./src/ui/index.js dist/ui/
node scripts/emitUiDts.mjs
cp ./src/editor/svelte/Root.svelte dist/editor/svelte/
