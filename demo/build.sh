#!/bin/bash

cd "$(dirname "$0")" || exit 1

set -e
set -x

rm -rf ../dist-demo
rm -rf ./dist
mkdir ../dist-demo/
npm run build
cp ./dist/site.js ../dist-demo/
cp ./index.html ../dist-demo/
cp ../README.md ../dist-demo/

git checkout github-pages
cp -f ../dist-demo/* ../

echo "done"