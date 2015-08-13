new_filename=$(echo $filename | tr '[:upper:]' '[:lower:]')
new_filepath=$( echo $filepath | sed s/$filename/$new_filename/g)

log_same "PROCESSED $FILES_COUNT FILES"

if [ "$filename" != "$new_filename" ]; then
	log "RENAME: $filename => $new_filename "
	if [[ $MODE = 'APPLY' ]]; then
		mv $filepath $new_filepath
	fi
fi