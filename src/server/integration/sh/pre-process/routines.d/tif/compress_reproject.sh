#!/bin/bash

PROJ="epsg:4674"
COMPRESSION_TYPE="deflate"
sirgas=$(gdalinfo $filepath | grep -i "SIRGAS 2000\|COMPRESSION=$COMPRESSION_TYPE" | wc -l)

if [ ! $sirgas -eq 2 ]; then
	log "gdal_translate $COMPRESSION_TYPE $PROJ: $filename"

	if [[ $MODE = 'APPLY' ]]; then
		new_filepath=$filepath_noext-sirgas
		gdal_translate -co COMPRESS=$COMPRESSION_TYPE -co INTERLEAVE=BAND -co TILED=YES -a_srs $PROJ $filepath_noext.tif $new_filepath.tif
		rm $filepath_noext.tif
		mv $new_filepath.tif $filepath_noext.tif
	fi

fi