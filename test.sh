#!/bin/bash

yarn="./node_modules/yarn/bin/yarn"

echo "Building"
${yarn} --cwd="./frontend" run build
