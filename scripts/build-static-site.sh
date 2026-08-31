#!/bin/sh
set -eu

rm -rf .next out

./scripts/run-node.sh node_modules/next/dist/bin/next build

cp -R server/public/. out/
