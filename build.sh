#!/bin/sh

echo "Installing Packages....."
yarn --cwd="./frontend" & 
yarn --cwd="./backend" 

echo "Building app......"
yarn --cwd="./backend" build &
yarn --cwd="./frontend" build && mv ./frontend/build backend/dist
