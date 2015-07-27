#!/bin/bash

while true; do
	ant build -Dapp.path=app -Dapp.build=./build
	inotifywait -r -e modify,attrib,close_write,move,create,delete .
done
