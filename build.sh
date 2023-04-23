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




echo "..........Building frontend............"
${yarn} --cwd="./frontend" run build >& /dev/null

echo "..........Building backend............"
rm -r backend/dist
${yarn} --cwd="./backend" run build
mv ./frontend/build backend/dist
