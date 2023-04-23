#!/bin/bash

echo "..........Installing yarn..........."
npm install yarn

yarn="./node_modules/yarn/bin/yarn"


echo ".........Installing frontend packages........."
${yarn} --cwd="./frontend"

echo ".........Installing backend packages........."
${yarn} --cwd="./backend"




echo "..........Building frontend............"
${yarn} --cwd="./frontend" run build >& /dev/null

echo "..........Building backend............"
${yarn} --cwd="./backend" run build
[[ -d ./backend/dist/build ]] && rm -r ./backend/dist/build
mv ./frontend/build backend/dist/
