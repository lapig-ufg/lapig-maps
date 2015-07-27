#!/bin/bash

escape() {
	echo "$1" | sed 's/\ /\\\ /g'
}

log_same() {
	echo -ne "\r    $1"
}

log() {
	echo "    $1"
}

BASE_DIR="$(escape $(dirname $0))"
RUN_DIR="$BASE_DIR/run.d"
ALL_DIR="$RUN_DIR/all"
INVALID_FILES_DIR="$BASE_DIR/invalid_files"

TITLES_FILE="$BASE_DIR/../alias/title.json"

if [ $# -eq 0 ]; then
	echo "Inform the GIS files path"
	exit

elif [ $# -eq 1 ]; then
	ROUTINE_PARAM=""
	PATH_GIS="$1"

elif [ $# -eq 2 ]; then
	ROUTINE_PARAM="$1"
	PATH_GIS="$2"

	RUN_DIR="$BASE_DIR/routines.d"
	ALL_DIR="$RUN_DIR/all"

fi

exec_routines() {

	[[ $RUN_DIR == "$BASE_DIR/run.d" ]] && ext=$(echo "$1" | cut -b4-) || ext="$1"
	
	EXT_DIR="$RUN_DIR/$1"

	for routine in $(ls $EXT_DIR); do
		[[ $ROUTINE_PARAM != '' && $ROUTINE_PARAM != $routine ]] && continue
		
		[[ $ext = 'all' ]] && regex='' || regex=".$ext"
		echo " => executing $routine"
		
		IFS=$'\n'

		FILES_COUNT=0

		for filepath in $(find "$PATH_GIS" -type f -iname "*$regex"); do
			FILES_COUNT=$((FILES_COUNT + 1))

			filename=$(escape $(basename "$filepath"))
			filename_noext="${filename%.*}"
			
			file_basedir="$(dirname $filepath)"
			filepath_noext="$file_basedir/$filename_noext"

			. "$EXT_DIR/$routine"
		done
		echo ''
	done
	
}

for dir in $(ls $RUN_DIR); do
	echo "ROUTINES ($dir)"
	exec_routines $dir
done