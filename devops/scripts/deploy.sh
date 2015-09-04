#!/bin/bash

JAVA_DIR="/data/programas/jdk/1.7.0_51"
ANT_DIR="/data/programas/apache-ant-1.9.5"
MONGODB_DIR="/opt/mongodb-linux-x86_64-debian71-3.0.2"

REPOSITORY_DIR="$HOME/repositories/lapig"
PROD_DIR="/data/lapig-maps/prod"
CATALOG_DIR="/data/catalog"

DB_NAME="lapig-maps"

mkdir -p $REPOSITORY_DIR
mkdir -p $PROD_DIR

case $1 in
	'prod')
			echo "Deploy LAPIG-MAPS"

			echo " 1) Update sources"
			cd $REPOSITORY_DIR
			git pull
			rm -fR $PROD_DIR/*
			cp -R $REPOSITORY_DIR/src/* $PROD_DIR/
			
			echo " 2) OWS"
			cd $PROD_DIR/ows
			npm install
			ln -s $CATALOG_DIR data_dir/catalog
			
			echo " 3) Server"
			cd $PROD_DIR/server
			npm install
			
			echo " 4) Client"
			cd $PROD_DIR/client
			export JAVA_HOME=$JAVA_DIR; $ANT_DIR/bin/ant build -Dapp.path=app -Dapp.build=./build

			echo " 5) DB"
			cd $PROD_DIR/db
			$MONGODB_DIR/bin/mongo $DB_NAME --eval "db.dropDatabase()"
			$MONGODB_DIR/bin/mongorestore -d $DB_NAME prod/$DB_NAME

			echo " 6) Restart LAPIG-MAPS"
			kill $(pgrep -f node\ app-cluster) &> /dev/null
		;;
		
esac
echo "Done !!!"











