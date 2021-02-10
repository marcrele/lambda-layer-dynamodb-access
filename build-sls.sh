#!/bin/bash
echo "compile typescript"
tsc

echo "copy files to destination folder"
copyfiles -f src/main/package.json dynamodb_access_layer/node_modules/dynamodb_access
copyfiles -f lib/* dynamodb_access_layer/node_modules/dynamodb_access

echo "install inner dependencies"
cd dynamodb_access_layer/node_modules/dynamodb_access && npm i