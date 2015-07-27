
if [ -z $(cat $TITLES_FILE | grep $filename_noext) ]; then
	log "TITLE NOT EXISTS $filepath"
fi