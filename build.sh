#!/bin/sh

frontend(){
    yarn --cwd="./frontend" install
    yarn --cwd="./frontend" run build
    mkdir -p backend/dist
    cp -r ./frontend/build backend/dist/
}


backend(){
    yarn --cwd="./backend" install
    yarn --cwd="./backend" run build
}

backend
frontend
