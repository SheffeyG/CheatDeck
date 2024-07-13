#!/usr/bin/env bash

# this script is only for update decky plugins' frontend.

plugin_name="CheatDeck"
out_dir="pkg"
plugin_sources=(
  "assets/"
  "defaults/"
  "main.py"
  "plugin.json"
  "package.json"
  "README.md"
  "LICENSE"
)

mkdir -p "$out_dir/src"
npx rollup -c
cp "dist/index.js" "$out_dir/src"

for source in "${plugin_sources[@]}"; do
  if [ -e "$source" ]; then
    if [ -d "$source" ]; then
      cp -r "$source" "$out_dir"
    else
      cp "$source" "$out_dir"
    fi
  fi
done

cd "$out_dir"
zip -r "../$plugin_name.zip" ./*
