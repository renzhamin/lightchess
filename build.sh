#!/bin/sh

mkdir -p ./backend/src/build/

cd ./frontend
yarn
yarn add chart.js
yarn run build

cd ../backend
yarn
yarn run build

cd ..

ln -sf ../.env ./backend/
