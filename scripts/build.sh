#!/bin/bash

set -e

# cd to the root dir
root="$(pwd)/$(dirname "$0")/.."
cd "$root" || exit 1

PATH="$(npm bin):$PATH"
# XXX: $PACKAGE_OUTPUT_PATH must be an absolute path!
dir=${PACKAGE_OUTPUT_PATH:-"$root/dist"}

echo "- Clean the destination folder"
rm -rf "$dir"

echo "- Transpile the TypeScript using Babel"
env NODE_ENV='es5' babel src --source-root src --out-dir "$dir/" --ignore src/**/*.test.ts --extensions .ts --quiet

echo "- Transpile the TypeScript using tsc"
tsc -p tsconfig.emit.json

echo "- Transform and copy package.json"
./scripts/transform.js

echo "- Copy README and License"

echo "- Remove test files from dist folder"
find "$dir" -type f -name "*.test.js" -delete

cp LICENSE $dir
cp README.md $dir
