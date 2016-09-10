#!/bin/bash

JAVA_DIR="/data/programas/jdk/1.7.0_51"
ANT_DIR="/data/programas/apache-ant-1.9.5"
MONGODB_DIR="/opt/mongodb-linux-x86_64-debian71-3.0.2"

REPOSITORY_DIR="$HOME/repositories/lapig"
TMP_PROD_DIR="/data/lapig-maps/prod_tmp"
PROD_DIR="/data/lapig-maps/prod"
CATALOG_DIR="/data/catalog"

DB_NAME="lapig-maps"

mkdir -p $REPOSITORY_DIR
mkdir -p $TMP_PROD_DIR

case $1 in
	'prod')
			echo "Deploy LAPIG-MAPS"

			echo " 1) Updating sources"
			cd $REPOSITORY_DIR
			git pull
			rm -fR $TMP_PROD_DIR/*
			cp -R $REPOSITORY_DIR/src/* $TMP_PROD_DIR/
			
			echo " 2) Building OWS"
			cd $TMP_PROD_DIR/ows
			npm install
			ln -s $CATALOG_DIR data_dir/catalog
			
			echo " 3) Building Server"
			cd $TMP_PROD_DIR/server
			npm install
			ln -s /data/catalog/time-series-db/ integration/py/time-series/image-db
			
			echo " 4) Building Client"
			cd $TMP_PROD_DIR/client
			export JAVA_HOME=$JAVA_DIR; $ANT_DIR/bin/ant build -Dapp.path=app -Dapp.build=./build

			echo " 5) Updating DB"
			cd $TMP_PROD_DIR/db
			
			$MONGODB_DIR/bin/mongo $DB_NAME --eval "db.layers.drop()"
			$MONGODB_DIR/bin/mongo $DB_NAME --eval "db.spatialInteligence.drop()"
			$MONGODB_DIR/bin/mongo $DB_NAME --eval "db.timeSeries.drop()"

			$MONGODB_DIR/bin/mongorestore -d $DB_NAME -c layers prod/$DB_NAME/layers.bson
			$MONGODB_DIR/bin/mongorestore -d $DB_NAME -c spatialInteligence prod/$DB_NAME/spatialInteligence.bson
			$MONGODB_DIR/bin/mongorestore -d $DB_NAME -c timeSeries prod/$DB_NAME/timeSeries.bson

			echo " 6) Replacing production enviroment"
			rm -fR $PROD_DIR/*
			mv $TMP_PROD_DIR $PROD_DIR

			echo " 7) Restarting LAPIG-MAPS"
			pgrep -f /data/lapig-maps/prod/ows/app-cluster.js | xargs kill
			pgrep -f /data/lapig-maps/prod/server/app-cluster.js | xargs kill
		;;
		
esac
echo "Done !!!"











