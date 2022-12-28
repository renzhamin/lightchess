#!/bin/sh

mkdir -p ./backend/src/build/
rm ./frontend/package-lock.json
rm ./backend/package-lock.json

cd ./frontend
yarn
yarn run build

cd ../backend
yarn
yarn run build

cd ..

ln -sf ../.env ./backend/
