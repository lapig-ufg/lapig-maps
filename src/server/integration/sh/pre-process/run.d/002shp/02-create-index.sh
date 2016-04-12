if 	[ ! -e $filepath_noext.qix ]; then
	log "CREATE INDEX FILE $filepath_noext.qix"
	
	if [[ $MODE = 'APPLY' ]]; then
		ogrinfo -sql "CREATE SPATIAL INDEX ON $filename_noext" $filepath_noext.shp
	fi
fi