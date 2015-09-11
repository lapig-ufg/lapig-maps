filename=$(basename $filepath)

log_same "PROCESSED $FILES_COUNT FILES"

if [ -z "$(echo ${filename##*.} | grep 'shp\|shx\|dbf\|prj\|qix\|tif\|tfw\|sld\|map\|kml\|kmz\|png\|jpg\|pdf\|.tif.aux.xml')" ]; then
	log "DELETE: $filename"
	if [[ $MODE = 'APPLY' ]]; then
		rm -f $filepath
	fi
fi 