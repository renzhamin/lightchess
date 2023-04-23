#!/bin/bash

rm -r ./frontend/node_modules
rm -r ./backend/node_modules

echo "..........Installing yarn..........."
npm install yarn

yarn="./node_modules/yarn/bin/yarn"

echo ".........Installing frontend packages........."
${yarn} --cwd="./frontend"

echo ".........Installing backend packages........."
${yarn} --cwd="./backend"

echo "..........Building app............"
${yarn} --cwd="./backend" build &
${yarn} --cwd="./frontend" build && mv ./frontend/build backend/dist
