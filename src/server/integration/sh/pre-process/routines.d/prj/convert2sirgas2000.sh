#!/bin/bash

export SHAPE_ENCODING="UTF-8"
SRS_DEF='GEOGCS["SIRGAS 2000",DATUM["D_SIRGAS_2000",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295],AUTHORITY["EPSG","4674"]]'

sirgas=$(cat $filepath | grep -i 'SIRGAS 2000')

if [ -z "$sirgas" ]; then
	log "ogr2ogr epsg:4674: $filename"
	
	if [[ $MODE = 'APPLY' ]]; then
		new_filepath=$filepath_noext-sirgas

		ogr2ogr $new_filepath.shp $filepath_noext.shp -t_srs "$SRS_DEF"
		
		rm $filepath_noext.shp $filepath_noext.shx $filepath_noext.dbf $filepath_noext.prj
		
		mv $new_filepath.shp $filepath_noext.shp
		mv $new_filepath.shx $filepath_noext.shx
		mv $new_filepath.dbf $filepath_noext.dbf
		mv $new_filepath.prj $filepath_noext.prj

		echo -n $SRS_DEF > $filepath_noext.prj
	fi

fi