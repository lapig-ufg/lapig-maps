filename=$(basename $filepath)

log_same "PROCESSED $FILES_COUNT FILES"

if [ -z "$(echo ${filename##*.} | grep 'shx\|prj\|shp\|sld\|html\|dbf\|xml\|tfw\|tif')" ]; then
	log "DELETE: $filename"
	rm -f $filepath
fi 