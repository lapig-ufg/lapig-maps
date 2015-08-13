filename=$(basename $filepath)

log_same "PROCESSED $FILES_COUNT FILES"

if [ -z "$(echo ${filename##*.} | grep 'shp\|shx\|dbf\|prj\|tif\|sld\|map\|kml\|png\|pdf')" ]; then
	log "DELETE: $filename"
	if [[ $MODE = 'APPLY' ]]; then
		rm -f $filepath
	fi
fi 