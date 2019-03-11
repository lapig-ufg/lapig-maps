#!/bin/bash

JAVA_DIR="/data/programas/jdk/1.7.0_51"
ANT_DIR="/data/programas/apache-ant-1.9.5"
MONGODB_DIR="/data/programas/mongodb-linux-x86_64-debian81-3.4.2"

REPOSITORY_DIR="$HOME/repositories/lapig"
TMP_PROD_DIR="/data/lapig-maps/prod_tmp"
PROD_DIR="/data/lapig-maps/prod"

DB_NAME="lapig-maps"

mkdir -p $REPOSITORY_DIR
mkdir -p $TMP_PROD_DIR

case $1 in
	'prod')
			echo "Deploy LAPIG-MAPS-SERVER"

			echo " 1) Updating sources"
			cd $REPOSITORY_DIR
			git pull
			rm -fR $TMP_PROD_DIR/*
			cp -R $REPOSITORY_DIR/src/* $TMP_PROD_DIR/
			
			echo " 2) Building Server"
			cd $TMP_PROD_DIR/server
			npm install
			ln -s /data/catalog/time-series-db/ integration/py/time-series/image-db
			
			echo " 3) Building Client"
			cd $TMP_PROD_DIR/client
			export JAVA_HOME=$JAVA_DIR; $ANT_DIR/bin/ant build -Dapp.path=app -Dapp.build=./build

			echo " 4) Updating DB"
			cd $TMP_PROD_DIR/db
			
			$MONGODB_DIR/bin/mongo $DB_NAME --eval "db.layers.drop()"
			$MONGODB_DIR/bin/mongo $DB_NAME --eval "db.spatialInteligence.drop()"
			$MONGODB_DIR/bin/mongo $DB_NAME --eval "db.timeSeries.drop()"

			$MONGODB_DIR/bin/mongorestore -d $DB_NAME -c layers prod/$DB_NAME/layers.bson
			$MONGODB_DIR/bin/mongorestore -d $DB_NAME -c spatialInteligence prod/$DB_NAME/spatialInteligence.bson
			$MONGODB_DIR/bin/mongorestore -d $DB_NAME -c timeSeries prod/$DB_NAME/timeSeries.bson

			echo " 5) Replacing production enviroment"
			cp -R $PROD_DIR/server/passwords.json $TMP_PROD_DIR/server/
			cp -R $PROD_DIR/server/integration/py/time-series/conf/lapig-ee-09144f43f3b5.pem $TMP_PROD_DIR/server/integration/py/time-series/conf/
			rm -fR $PROD_DIR
			mv $TMP_PROD_DIR $PROD_DIR

			echo " 6) Restarting LAPIG-MAPS"
			sudo /etc/init.d/lapig-maps-server stop
			sudo /etc/init.d/lapig-maps-server start
		;;
		
esac
echo "Done !!!"











