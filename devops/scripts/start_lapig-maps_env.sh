#!/bin/bash

#Programa para inicializar automaticamente os serviços necessários para executar o ambiente Lapig-maps.

MONGOPS=0
REDISPS=0
SERVERPS=0
CLIENTPS=0

terminate(){
	echo -e '\nWill terminate now.\n'
	echo "mongo_pid: $MONGOPS; redis_pid: $REDISPS; server_pid: $SERVERPS; client_pid: $CLIENTPS"
	kill $MONGOPS
	kill $REDISPS
	kill $SERVERPS
	kill $CLIENTPS
	exit 0
}

trap terminate SIGHUP SIGINT SIGTERM

echo 'Starting MONGO'
mongod 2> mongo_err.log &
MONGOPS=$!
sleep 4

echo 'Starting REDIS'
redis-server 2> redis_err.log &
REDISPS=$!
sleep 2

echo 'Starting CLIENT'
pushd 'lapig-maps/src/client'
./start.sh 2> ../../../client_err.log &
CLIENTPS=$!
sleep 15
popd

echo 'Starting SERVER'
pushd 'lapig-maps/src/server'
./start.sh &
SERVERPS=$!
sleep 1
echo "mongo_pid: $MONGOPS; redis_pid: $REDISPS; server_pid: $SERVERPS; client_pid: $CLIENTPS"

wait