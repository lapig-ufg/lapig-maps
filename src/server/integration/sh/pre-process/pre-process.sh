#!/bin/bash

usage() { 
	echo "Usage: $0 [ -m <SHOW (default) | APPLY> ] [ -r <SLINK_ROUNTINE_NAME>] -d DIR_GIS_FILES" 1>&2
	exit 1 
}

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

function get_params() {
	
	while getopts $SCRIPT_OPTS opt; do
		if [ $opt = '?' ]; then 
			echo "Invalid option -$OPTARG"
			usage
		else
			if [ $opt = ':' ]; then
				eval "$OPTARG=1" &> /dev/null
			else
				eval "$opt=$OPTARG" &> /dev/null
			fi
		fi
	done

}

SCRIPT_OPTS=":h:d:m:r:"
get_params $@

[[ -z $d ]] && usage
[[ $h = '1' ]] && usage
[[ $m != 'show' ]] && MODE=${m^^}

PATH_GIS="$d"
ROUTINE_PARAM="$r"

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

if [[ $MODE = 'APPLY' ]]; then
	echo -e "All the changes was apply, use -dapply to do that.\nI hope you know what you're doing !!!"
else
	echo -e "No change was made, use -dapply to do that.\nUse with caution !!!"

fi