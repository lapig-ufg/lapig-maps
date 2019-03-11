#!/bin/bash

REPOSITORY_DIR="$HOME/repositories/lapig-maps"
TMP_PROD_DIR="/data/lapig-maps/prod_tmp"
PROD_DIR="/data/lapig-maps/prod"
CATALOG_DIR="/data/catalog"

mkdir -p $REPOSITORY_DIR
mkdir -p $TMP_PROD_DIR

case $1 in
	'prod')
			echo "Deploy LAPIG-MAPS-OWS"

			echo " 1) Updating sources"
			cd $REPOSITORY_DIR
			git pull
			rm -fR $TMP_PROD_DIR/*
			cp -R $REPOSITORY_DIR/src/* $TMP_PROD_DIR/
			
			echo " 2) Building OWS"
			cd $TMP_PROD_DIR/ows
			npm install
			ln -s $CATALOG_DIR data_dir/catalog

			echo " 3) Replacing production enviroment"
			rm -fR $PROD_DIR
			mv $TMP_PROD_DIR $PROD_DIR

			echo " 4) Restarting LAPIG-MAPS"
			sudo /etc/init.d/lapig-maps-ows stop
			sudo /etc/init.d/lapig-maps-ows start
		;;
		
esac
echo "Done !!!"











