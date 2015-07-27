if 	[ ! -e $filepath_noext.shp ] || [ ! -e $filepath_noext.shx ] || [ ! -e $filepath_noext.dbf ] || [ ! -e $filepath_noext.prj ]; then
	log "INVALID FILE $filepath_noext.shp"
	
	dest_invalid_file=$INVALID_FILES_DIR$filepath_noext
	mkdir -p $dest_invalid_file

	mv $filepath_noext* $dest_invalid_file

fi