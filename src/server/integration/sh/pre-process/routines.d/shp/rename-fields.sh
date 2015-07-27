#!/bin/bash

log_same "PROCESSED $FILES_COUNT FILES"

fields=$(for field in $(ogrinfo --config SHAPE_ENCODING 'UTF-8' -geom=NO -so $filepath $filename_noext | grep 'Integer\ (\|Real\ (\|String\ (\|Date\ (' | cut -d: -f1); do
	echo -n $field AS $(echo $field | tr '[:upper:]' '[:lower:]' | iconv -f utf8 -t ascii//TRANSLIT),\  
done | cut -b1-)
fields=${fields::-2}

SRS_DEF='GEOGCS["SIRGAS 2000",DATUM["D_SIRGAS_2000",SPHEROID["GRS_1980",6378137,298.257222101]],PRIMEM["Greenwich",0],UNIT["Degree",0.017453292519943295],AUTHORITY["EPSG","4674"]]'
sirgas=$(cat $filepath_noext.prj | grep -i 'SIRGAS 2000')
[[ -z $sirgas ]] && reproject=" -t_srs '$SRS_DEF' " || reproject=""

new_filepath=$filepath_noext-new

ogr2ogr --config SHAPE_ENCODING 'UTF-8' $new_filepath.shp $filepath $reproject -sql "SELECT $fields from $filename_noext" &> /dev/null

cat $filepath_noext.sld | sed 's=\(<ogc\:PropertyName>\)\([A-Za-z][A-Za-z0-9_-]*\)\(<\/ogc\:PropertyName>\)=\1\L\2\E\3=' > $new_filepath.sld

rm $filepath_noext.shp $filepath_noext.shx $filepath_noext.dbf $filepath_noext.prj $filepath_noext.sld
	
mv $new_filepath.shp $filepath_noext.shp
mv $new_filepath.shx $filepath_noext.shx
mv $new_filepath.dbf $filepath_noext.dbf
mv $new_filepath.prj $filepath_noext.prj
mv $new_filepath.sld $filepath_noext.sld